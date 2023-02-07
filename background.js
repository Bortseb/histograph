let urlMap = [];
//import {Graph} from "https://wardcunningham.github.io/graph/graph.js"
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

const graph = new Graph();

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


const channel = new BroadcastChannel('GRAPH');

channel.onmessage = (msg) => {
  console.log('Graph request received from popup', msg);
  channel.postMessage({ graph: graph });
 };

browser.tabs.onRemoved.addListener((tabId) => {
  updateCount(tabId, true);
});
browser.tabs.onCreated.addListener((tabId) => {
  updateCount(tabId, false);
});

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} was activated`);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.url /*&& changeInfo.status === "complete"*/) {
    console.log(`Tab: ${tabId} URL changed to ${changeInfo.url}. tabInfo.openerTabId = ${tabInfo.openerTabId}, or changeInfo.openerTabId = ${changeInfo.openerTabId}, changeInfo.status = ${changeInfo.status}`);
    const nodeID = graph.addNode("URL", { name: tabInfo.url, url: tabInfo.url });
    urlMap[nodeID] = changeInfo.url;
    console.log(`urlMap = ${urlMap}`);
  }
});

updateCount();
