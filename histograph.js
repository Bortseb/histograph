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

const channel = new BroadcastChannel("GRAPH");

let graph = {}

channel.onmessage = (msg) => {
  console.log("Graph received from service worker", msg);
  graph = msg.data.graph;
  console.log(`The graph is ${graph}`);
  console.log(`The graph is ${JSON.stringify(graph,null,2) }`);
};


document.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    console.log(e);
  }
  if (e.target.id === "window-to-graph") {
    /*browser.tabs.query({ currentWindow: true }).then(
      (tabs) => {
        const graph = new Graph();
        for (const tab of tabs) {
          // tab.url requires the `tabs` permission or a matching host permission.
          //console.log({...tab});
          graph.addNode("Tab", { name: tab.title });
        }
        console.log(graph, graph.stringify(null, 2));
        download(graph.stringify(null, 2), "tabs.graph.json");
      },
      (error) => {
        console.error(`Error: ${error}`);
      }
      );*/
      
    channel.postMessage({ msg: 'Popup requests graph'});
    download(graph, "tabs.graph.json");
  }
});
