// move to using idb promised for graph persistence, then remove anything that isn't directly related to responding to events
import { Graph } from "./graph.js";
import { get, set, update, clear } from "./idb-keyval@6.2.0-dist-index.js";
let graph = new Graph();
let requests = "";

get("graph").then((val) => {
  if (val) {
    console.log("graph existed", val);
    let graph = new Graph(val.nodes, val.rels);
    console.log("Graph is now:", graph);
  } else {
    console.log("Val doesn't evaluate as true for graph", val);
  }
});

get("requests").then((val) => {
  if (val) {
    let requests = val;
  } else {
    console.log("Val doesn't evaluate as true for requests", val);
  }
});

let nids = {};
let rels = {};
let activeTab = "";
let openedBy = {};
let tabURL = {};
let tabData = {};

function addURL(url) {
  if (url in nids) {
    return nids[url];
  } else {
    return (nids[url] = graph.addNode("URL", { name: url, url: url }));
  }
}

function addLink(source, target, type, props) {
  return (rels[target] = graph.addRel(`${type}`, source, target, props));
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
      console.log("trying to DL", graph, graph.stringify(null, 2));
      download(graph.stringify(null, 2), `tabs ${Date.now()}.graph.json`);
      break;
    case "clear":
      graph = new Graph();
      clear();
      nids = {};
      tabData = {};
      break;
    case "click":
      const source = addURL(msg.source);
      const target = addURL(msg.target);
      addLink(source, target, msg.type, { which: "click on page" });
      tabURL[sender.tab.id] = target;
      break;
    case "change tab": //currently changes to tab#3, but in the future, use this to change to arbitrary tabID
      browser.tabs.update(msg.tabId, { active: true });
      break;
    case "collaborator":
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

  if ("url" in changeInfo) {
    addURL(changeInfo.url);
    set("graph", graph)
      .then(() => console.log("Setting graph worked!"))
      .catch((err) => console.log("Setting graph failed!", err));
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
  console.log(
    "webNavigation.onCommitted:",
    event /*.transitionType, event.transitionQualifiers*/
  );
});

browser.webNavigation.onCompleted.addListener((event) => {
  console.log(
    "webNavigation.onCompleted:",
    event /*.transitionType, event.transitionQualifiers*/
  );
});

//TODO, make all event listeners here modify the graph in some way, assuming this will be non-persistent soon. Persistent : false will be added to the background in manaifest once this is done.

function request_listener(details, event_type) {

  //TODO make this listener compile everything it hears into a JSONL doc to parse with jq later
  if (details.type === "script") {
  }
  //details.url is the request url, for things like client.js
  //details.type is either main_frame or script
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = (event) => {
    console.log("requestID", details.requestId);
    console.log("webrequest event", event);
    let str = decoder.decode(event.data, { stream: true });
    console.log("filtered response", str);
    // Just change any instance of Example in the HTTP response
    // to WebExtension Example.
    //str = str.replace(/Example/g, 'WebExtension Example');
    //filter.write(encoder.encode(str));
    filter.disconnect();
  };

  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => { request_listener(details, "onBeforeRequest") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => { request_listener(details, "onBeforeSendHeaders") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onSendHeaders.addListener(
  (details) => { request_listener(details, "onSendHeaders") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onHeadersReceived.addListener(
  (details) => { request_listener(details, "onHeadersReceived") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onAuthRequired.addListener(
  (details) => { request_listener(details, "onAuthRequired") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onResponseStarted.addListener(
  (details) => { request_listener(details, "onResponseStarted") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onBeforeRedirect.addListener(
  (details) => { request_listener(details, "onBeforeRedirect") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onCompleted.addListener(
  (details) => { request_listener(details, "onCompleted") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });
browser.webRequest.onErrorOccurred.addListener(
  (details) => { request_listener(details, "onErrorOccurred") },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "script"] });