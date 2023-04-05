// move to using idb promised for graph persistence, then remove anything that isn't directly related to responding toget( events
import { Graph } from "./graph.js";
import { get, set, update, clear } from "./idb-keyval@6.2.0-dist-index.js";
var graph = new Graph();
var jsonl = "";

async function awaitGraph() {
  try {
    var getGraph = await get("graph")
  } catch (err) {
    console.error(err)
    throw err;
  }
  graph = new Graph(getGraph.nodes, getGraph.rels)
}

awaitGraph()

async function awaitJsonl() {
  try {
    var getJsonl = await get("jsonl")
  } catch (err) {
    console.error(err)
    throw err;
  }
  jsonl = getJsonl
}

awaitJsonl()

let nids = {} // associates each URL to its node id
let rels = {}
let activeTab = ""
let openedBy = {}
let tabURL = {}
let tabData = {}
let tabNode = {}

function addURL(url) {
  if (url in nids) {
    return nids[url];
  } else {
    nids[url] = graph.addNode("URL", { name: url, url: url })
    set("graph", graph)
      .then()
      .catch((err) => console.log("Setting graph failed!", err));
    return nids[url];
  }
}

function addLink(source, target, type, props) {
  rels[target] = graph.addRel(`${type}`, source, target, props)
  set("graph", graph)
    .then()
    .catch((err) => console.log("Setting graph failed!", err));
  return rels[target]
}

function download(string, file, mime = "text/json") {
  let data = `data:${mime};charset=utf-8,` + encodeURIComponent(string);
  let anchor = document.createElement("a");
  anchor.setAttribute("href", data);
  anchor.setAttribute("download", file);
  document.body.appendChild(anchor); // required for firefox
  anchor.click();
  anchor.remove();

  /* Backup download method, requires download api permission
  window.URL = window.webkitURL || window.URL;
  file = new Blob([string],{type:'text/json'});
  browser.downloads.download({
    url : window.URL.createObjectURL(file),
    filename : 'test.graph.json',
    conflictAction : 'uniquify'
  });*/
}

//Shows tab count badge on extension button
function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({}).then((tabs) => {
    let length = tabs.length;

    // onRemoved fires too early and the count is one too many.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (
      isOnRemoved &&
      tabId &&
      tabs
        .map((t) => {
          return t.id;
        })
        .includes(tabId)
    ) {
      length--;
    }

    browser.browserAction.setBadgeText({ text: length.toString() });
    if (length > 2) {
      browser.browserAction.setBadgeBackgroundColor({ color: "green" });
    } else {
      browser.browserAction.setBadgeBackgroundColor({ color: "red" });
    }
  });
}

updateCount();

//Receiving commands from other scripts
browser.runtime.onMessage.addListener((msg, sender) => {
  switch (msg.cmd) {
    case "download":
      download(graph.stringify(null, 2), `tabs ${Date.now()}.graph.json`);
      break;
    case "jsonl":
      console.log("trying to DL jsonl", jsonl, JSON.stringify(jsonl, null, 2));
      download(jsonl, `jsonl ${Date.now()}.json`);
      break;
    case "clear":
      graph = new Graph();
      set("graph", graph)
        .then()
        .catch((err) => console.log("Clearing graph failed!", err));
      jsonl = ""
      set("jsonl", jsonl)
        .then()
        .catch((err) => console.log("Clearing jsonl failed!", err));
      nids = {};
      tabData = {};
      break;
    case "click":
      const source = addURL(msg.source);
      const target = addURL(msg.target);
      addLink(source, target, msg.type, { which: "click on page" });
      tabURL[sender.tab.id] = target;
      break;
    case "change tab":
      browser.tabs.update(msg.tabId, { active: true });
      break;
    case "collaborator":
      graph = awaitGraph()
      console.log("awaited for graph from collaborator message", graph)

      let popupURL = browser.runtime.getURL("./collaborator.html");

      browser.windows
        .create({
          url: popupURL,
          type: "popup",
          allowScriptsToClose: true,
          titlePreface: "Collaborator",
          /*height: 400,
          width: 800,*/
        })
        .then(
          (windowInfo) => {
            console.log(`Created window: `, windowInfo);
            set("collaboratorID", windowInfo.id)
              .then(() => console.log("Setting collaboratorID worked!"))
              .catch((err) =>
                console.log("Setting collaboratorID failed!", err)
              );
          },
          (error) => {
            console.log(`Error: ${error}`);
          }
        );

      break;
    case "log":
      console.log("Logged event:", msg.event);
      break;
    default:
      console.log("Default case used for (msg) in background.js", msg);
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  updateCount(tabId, true);
});

browser.tabs.onCreated.addListener(async (e) => {
  updateCount(e, false);
  console.log("tabs.onCreated", e);
  /*console.log("New tab created, (e)", e);
  if ("openerTabId" in e) {
    const openerTab = await browser.tabs.get(e.openerTabId);
    const openerURL = openerTab.url;
    openedBy[e.id] = { url: openerURL, id: e.openerTabId };
  } else {
    addURL(e.url);
  }
  tabURL[e.id] = e.url;
  */
});

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log("tabs.onActivated", activeInfo);
  console.log({ activeInfo });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  console.log("tabs.onUpdated (changeInfo, tabInfo)", changeInfo, tabInfo);

  tabData[tabId] = tabInfo

  if ("url" in changeInfo) {
    addURL(changeInfo.url);
  }
  //Tab is starting to load something else after last complete status
  /*
  if (
    tabData[tabId].status === "complete" &&
    "status" in changeInfo &&
    changeInfo.status === "loading"
  ) {
    const nid = addURL(tabData[tabId].url);
    graph.nodes[nid].props["foo"] = "bar";
    tabData[tabId] = tabInfo;
  } else {
    tabData[tabId] = tabInfo;
  }
  */

  /*
  if ("status" in changeInfo && changeInfo.status === "complete") {
    const target = addURL(tabInfo.url);

    if (tabId in openedBy) {
      //new tab opened by other tab
      const source = addURL(openedBy[tabId].url);
      addLink(source, target, "new tab");
      delete openedBy[tabId];
    } else {
      //new tab opened without opener, or URL changed in existing tab
      const source = addURL(tabURL[tabId]);
      console.log("I think im adding source", source);
      addLink(tabId, target, "same tab");
      tabURL[tabId] = target;
    }
  }
  */
});

browser.webNavigation.onCommitted.addListener((event) => {
  tabData[event.tabId].transitionType = event.transitionType
  tabData[event.tabId].transitionQualifiers = event.transitionQualifiers
  console.log("TabData = ", tabData)
  console.log(
    "webNavigation.onCommitted:",
    event /*.transitionType, event.transitionQualifiers*/
  );
});

browser.webNavigation.onCompleted.addListener((event) => {
  // console.log(
  //   "webNavigation.onCompleted:",
  //   event /*.transitionType, event.transitionQualifiers*/
  // );
});

//TODO, make all event listeners here modify the graph in some way, assuming this will be non-persistent soon. Persistent : false will be added to the background in manaifest once this is done.

function request_listener(details, event_type) {
  const { type, requestId, ...rest } = details
  jsonl += JSON.stringify({ "request-type": event_type, "object-type": "request", "type": type, "requestId": requestId, ...rest }) + "\n"
  set("jsonl", jsonl)
    .then()
    .catch((err) => console.log("Setting jsonl failed!", err));

  if (details.type === "script") {
    if (details.url.split("/").pop() === "client.js") {

      let filter = browser.webRequest.filterResponseData(details.requestId);
      let decoder = new TextDecoder("utf-8");
      let encoder = new TextEncoder();

      filter.ondata = (event) => {
        let str = decoder.decode(event.data, { stream: true });
        const { type, ...rest } = event
        if (str.substring(0, 15) === "/*! wiki-client") {
          console.log("Graph before edit:", graph)
          // const nid = nids[]
          // console.log("Graph before edit:",graph.nodes)

          jsonl += JSON.stringify({ "request-type": event_type, "object-type": "response", "type": type, "requestId": details.requestId, "isWiki": true, ...rest }) + "\n"
          set("jsonl", jsonl)
            .then()
            .catch((err) => console.log("Setting jsonl failed!", err));
        } else {
          jsonl += JSON.stringify({ "request-type": event_type, "object-type": "response", "requestId": details.requestId, "isWiki": false, ...rest }) + "\n"
          set("jsonl", jsonl)
            .then()
            .catch((err) => console.log("Setting jsonl failed!", err));
        }

        filter.write(encoder.encode(str));
        filter.disconnect();
      };
    }
  }

  return {};
}


// Other options image media object other web_manifest xmlhttprequest 
browser.webRequest.onBeforeRequest.addListener( //unique objects: requestBody,frameAncestors
  (details) => { request_listener(details, "onBeforeRequest") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] },
  ["blocking"]);
// browser.webRequest.onBeforeSendHeaders.addListener( //unique objects: requestHeaders Optional
//   (details) => { request_listener(details, "onBeforeSendHeaders") },
//   { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] },
//   /*["blocking"]*/);
// browser.webRequest.onSendHeaders.addListener( //unique objects: requestHeaders
//   (details) => { request_listener(details, "onSendHeaders") },
//   { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] });
// browser.webRequest.onHeadersReceived.addListener( //unique objects: frameAncestors
//   (details) => { request_listener(details, "onHeadersReceived") },
//   { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] },
//   /*["blocking"]*/);
// browser.webRequest.onAuthRequired.addListener( //unique objects: scheme, realm, isProxy, challenger
//   (details) => { request_listener(details, "onAuthRequired") },
//   { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] });
// browser.webRequest.onResponseStarted.addListener( //unique objects: 
//   (details) => { request_listener(details, "onResponseStarted") },
//   { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] });
browser.webRequest.onBeforeRedirect.addListener( //unique objects: redirectUrl
  (details) => { request_listener(details, "onBeforeRedirect") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] });
// browser.webRequest.onCompleted.addListener( //unique objects: 
//   (details) => { request_listener(details, "onCompleted") },
//   { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] });
browser.webRequest.onErrorOccurred.addListener( //unique objects: error
  (details) => { request_listener(details, "onErrorOccurred") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script", "object", "other", "web_manifest", "xmlhttprequest"] });