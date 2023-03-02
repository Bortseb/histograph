console.log("collaborator.js import worked")
import { Graph } from "./graph.js";
import { display } from "./display.js";

export let hpccWasm = window["@hpcc-js/wasm"]; 
let graph = browser.runtime.getBackgroundPage().graph
console.log("collaborator.js was run")

let beam = [{ name: "graph", graph: graph }]; //This might work, but I don't think this script knows what graph is? use local storage for graph passing?

const target = document.querySelector("#target");

display(beam, target);
