//import {Graph} from "https://wardcunningham.github.io/graph/graph.js"
let nids = {}

class Graph {
  constructor(nodes = [], rels = []) {
    this.nodes = nodes;
    this.rels = rels;
  }

  addNode(type, props = {}) {
    const obj = { type, in: [], out: [], props };
    this.nodes.push(obj);
    return this.nodes.length - 1;
  }

  addRel(type, from, to, props = {}) {
    const obj = { type, from, to, props };
    this.rels.push(obj);
    const rid = this.rels.length - 1;
    this.nodes[from].out.push(rid);
    this.nodes[to].in.push(rid);
    return rid;
  }

  tally() {
    const tally = (list) =>
      list.reduce((s, e) => {
        s[e.type] = s[e.type] ? s[e.type] + 1 : 1;
        return s;
      }, {});
    return { nodes: tally(this.nodes), rels: tally(this.rels) };
  }

  size() {
    return this.nodes.length + this.rels.length;
  }
  stringify(...args) {
    const obj = { nodes: this.nodes, rels: this.rels };
    return JSON.stringify(obj, ...args);
  }
}

function download(string, file, mime = "text/json") {
  data = `data:${mime};charset=utf-8,` + encodeURIComponent(string);
  var anchor = document.createElement("a");
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

let graph = new Graph();

browser.runtime.onMessage.addListener((msg) => {
  switch (msg.cmd) {
    case "download":
      download(graph.stringify(null, 2), "tabs.graph.json");
      break;
    case "clear":
      graph = new Graph();
      nids = {};
      break;
    case "click":
      console.log("Click message:" , msg)
      //const nodeID = graph.addNode("URL",...msg.data.obj);
      //urlMap[nodeID] = changeInfo.url;
      break;
    default:
      console.log("Default case used for (msg) in background.js", msg);
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  updateCount(tabId, true);
});
browser.tabs.onCreated.addListener((tabId) => {
  updateCount(tabId, false);
});

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} was activated`, activeInfo);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  console.log(`Tab ${tabId} changed:`, changeInfo)
  if (changeInfo.url) {
    console.log(`Tab # ${tabId} changed: (tabInfo)`,tabInfo)
    if(!(tabInfo.url in nids)){
      console.log(`Must record `,tabInfo.url)
      const nodeID = graph.addNode("URL", {
        name: tabInfo.url,
        title: tabInfo.title,
        url: tabInfo.url,
      });
      nids[tabInfo.url] = nodeID;
    }    
    else{
      console.log("Already have",tabInfo.url)
    }
  }
  else{
    console.log("The URL didn't change?")
  }
});

 