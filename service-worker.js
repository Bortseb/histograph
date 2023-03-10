import { Graph } from "./graph.js";
// move to using idb promised for graph persistence, then remove anything that isn't directly related to responding to events
let graph = new Graph();
browser.storage.local.get("graph").then(
  (data) => {
    console.log("stored data", data.graph);
  },
  (err) => {
    console.log(err);
  }
);

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
      browser.storage.local.clear().then(
        () => {
          console.log("OK");
        },
        (e) => {
          console.log(e);
        }
      );
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
      browser.tabs.update(3, { active: true });
      break;
    case "log":
      console.log("Logged event:", msg.event);
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
    browser.storage.local.set({
      graph: graph,
    });
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
