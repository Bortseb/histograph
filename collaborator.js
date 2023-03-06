import { Graph } from "./graph.js";
import { drop, dropl, dropu } from "./drop.js";
import { display } from "./display.js";

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