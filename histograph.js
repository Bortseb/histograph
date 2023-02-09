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

const channel = new BroadcastChannel("histograph");

let graph = new Graph();
graph.addNode("Test Node");

channel.onmessage = (msg) => {
  console.log("Message received in histograph context",msg)
  switch (msg.data.cmd){
    case "provide download":
      graph = new Graph(msg.data.obj.nodes, msg.data.obj.rels);
      download(graph.stringify(null, 2), "tabs.graph.json");
      break;
    case "add":
      console.log("Success, add node in popup from histograph.js)")
      break;
    default:
      console.log("No response for the following msg", msg)
  }
};

document.addEventListener("click", (e) => {
  if (e.target.id === "window-to-graph") {
    channel.postMessage({ cmd: "request download" });
  }
  
});
