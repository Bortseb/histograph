import { Graph } from "./graph.js";
import { drop, dropl, dropu } from "./drop.js";
export let hpccWasm = window["@hpcc-js/wasm"];
import { display } from "./display.js";

console.log("collaborator.js import worked");

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

const target = document.querySelector("#target");

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

/* first attempt to over simplify
import { Graph } from "./graph.js";
import { display } from "./display.js";
export let hpccWasm = window["@hpcc-js/wasm"];
let graph = browser.runtime.getBackgroundPage().graph;
console.log("collaborator.js was run");
//This might work, but I don't think this script knows what graph is? use local storage for graph passing?
let beam = [{ name: "graph", graph: graph }];
*/
