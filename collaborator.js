import { Graph } from "./graph.js";
import { drop, dropl } from "./drop.js";
import { display } from "./display.js";
import { get } from "./idb-keyval@6.2.0-dist-index.js";

console.log("collaborator.js import worked");

const target = document.getElementById("target");

let graph = await get("graph");

let beam = [
  {
    name: `tabs ${Date.now()}.graph.json`,
    graph: new Graph(graph.nodes, graph.rels),
  },
];

display(beam, target);

window.over = function (event) {
  event.preventDefault();
};

window.drop = async function (event) {
  event.preventDefault();
  beam.push(
    ...(await dropl(event, ".jsonl")),
    ...(await drop(event, ".graph.json"))
  );
  display(beam, target);
};

target.addEventListener("drop", (event) => {
  drop(event);
});

target.addEventListener("dragover", (event) => {
  over(event);
});

target.addEventListener("dragenter", (event) => {
  over(event);
});
