//import {Graph} from "https://wardcunningham.github.io/graph/graph.js"
class Graph {
  constructor(nodes=[], rels=[]) {
    this.nodes = nodes;
    this.rels = rels;
  }

  addNode(type, props={}){
    const obj = {type, in:[], out:[], props};
    this.nodes.push(obj);
    return this.nodes.length-1;
  }

  addRel(type, from, to, props={}) {
    const obj = {type, from, to, props};
    this.rels.push(obj);
    const rid = this.rels.length-1;
    this.nodes[from].out.push(rid)
    this.nodes[to].in.push(rid);
    return rid;
  }

  tally(){
    const tally = list => list.reduce((s,e)=>{s[e.type] = s[e.type] ? s[e.type]+1 : 1; return s}, {});
    return { nodes:tally(this.nodes), rels:tally(this.rels)};
  }

  size(){
    return this.nodes.length + this.rels.length;
  }
  stringify(...args) {
    const obj = { nodes: this.nodes, rels: this.rels }
    return JSON.stringify(obj, ...args)
  }

}

function download(string, file, mime='text/json') {
  window.URL = window.webkitURL || window.URL;
  file = new Blob([string],{type:'text/json'});
  browser.downloads.download({
    url : window.URL.createObjectURL(file),
    filename : 'test.graph.json',
    conflictAction : 'uniquify'
  });

  /****** previous attempt with anchor download attribute
  data = `data:${mime};charset=utf-8,` + encodeURIComponent(string)
  var anchor = document.createElement('a')
  anchor.setAttribute("href", data)
  anchor.setAttribute("target", "_blank")
  anchor.text = "test me"
  anchor.setAttribute("download", file)
  document.body.appendChild(anchor) // required for firefox
  anchor.click()
  //anchor.remove()*/
}

document.addEventListener("click", (e) => {
  if (e.target.id === "tabs-to-graph") {
    function logTabs(tabs) {
      const graph = new Graph()
      for (const tab of tabs) {
        // tab.url requires the `tabs` permission or a matching host permission.
        //console.log({...tab});
        graph.addNode("Tab",{name:tab.title})
      }
      console.log(graph,graph.stringify(null,2))
      download(graph.stringify(null,2),"tabs.graph.json")
    }
    
    function onError(error) {
      console.error(`Error: ${error}`);
    }
    
    browser.tabs.query({ currentWindow: true }).then(logTabs, onError);
  }
  e.preventDefault();
});
