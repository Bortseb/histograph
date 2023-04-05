import { Graph } from "./graph.js"
import { drop, dropl } from "./drop.js"
import { display } from "./display.js"
import { get } from "./idb-keyval@6.2.0-dist-index.js"

var graph = await get("graph")

const target = document.getElementById("target")

let beam = [
  {
    name: `tabs ${Date.now()}.graph.json`,
    graph: new Graph(graph.nodes, graph.rels),
  }
]

display(beam, target)

const dropping = async function (event) {
  beam = [
    ...(await dropl(event, ".jsonl")),
    ...(await drop(event, ".graph.json"))
  ]
  display(beam, target)
}

target.addEventListener("drop", (event) => {
  event.preventDefault()
  dropping(event)
})

target.addEventListener("dragover", (event) => {
  event.preventDefault()
})

target.addEventListener("dragenter", (event) => {
  event.preventDefault()
})
