import { Graph } from "./graph.js";
import { drop, dropl, dropu } from "./drop.js";
import { display } from "./display.js";
//window.hpccWasm = window["@hpcc-js/wasm"];
console.log("window=", window);
//console.log("hpccWasm",hpccWasm)
console.log("collaborator.js import worked");

const target = document.getElementById("target");

// const beam = await fetch('./SituatedInstitutions.jsonl')
//   .then(req => req.text())
//   .then(text => text.trim()
//     .split(/\n/)
//     .map(line => JSON.parse(line))
//     .map(({name,graph}) => ({name,graph:new Graph(graph.nodes, graph.rels)})))
// console.log({beam})

let beam = await fetch("./robert.graph.json")
  .then((req) => req.json())
  .then((json) => [
    { name: "robert", graph: new Graph(json.nodes, json.rels) },
  ]);
console.log("Beam=", beam);

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

display(beam, target);

target.addEventListener("drop", (event) => {
  drop(event);
});

target.addEventListener("dragover", (event) => {
  over(event);
});

target.addEventListener("dragenter", (event) => {
  over(event);
});

/* first attempt to over simplify
import { Graph } from "./graph.js";
import { display } from "./display.js";
export let hpccWasm = window["@hpcc-js/wasm"];
let graph = browser.runtime.getBackgroundPage().graph;
console.log("collaborator.js was run");
//This might work, but I don't think this script knows what graph is? use local storage for graph passing?
let beam = [{ name: "graph", graph: graph }];
*/
