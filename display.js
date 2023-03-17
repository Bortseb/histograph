//from https://github.com/WardCunningham/graph/blob/main/docs/collaborator/display.js
import { Graphviz } from "./graphviz.js";
import { composite } from "./composite.js";
import { dotify } from "./dotify.js";
import { hoverbold } from "./hoverbold.js";

const graphviz = await Graphviz.load();
let drawing = false;
let panSVG = null;
const panZoom = {};

export async function display(chosen, target) {
  let targetsvg = null;

  if (!drawing) {
    drawing = true;
    const complex = composite(chosen);
    try {
      if (targetsvg) {
        panZoom.pan = panSVG.getPan();
        panZoom.zoom = panSVG.getZoom();
        panZoom.size = {
          width: targetsvg.width.baseVal.valueInSpecifiedUnits,
          height: targetsvg.height.baseVal.valueInSpecifiedUnits,
        };
      }
      const dot = dotify(complex);
      window.dot = dot;
      const svg = graphviz.layout(window.dot, "svg", "dot");

      target.innerHTML = svg;
      targetsvg = target.querySelector("svg");

      //targetsvg.setAttribute("height", "100")
      const width = targetsvg.getBBox().width;
      const height = targetsvg.getBBox().height;
      console.log("height, width", height, width, `0 0 ${width} ${height}`);
      //targetsvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      //Window.resizeTo(width, height)
      drawing = false;
      hoverbold(target);
      const targetBounds = {
        width: target.clientWidth,
        height: target.clientHeight,
      };
      const svgBounds = {
        width: targetsvg.clientWidth,
        height: targetsvg.clientHeight,
      };
      let svgElement = targetsvg;
      panSVG = svgPanZoom(svgElement);
      targetsvg.style.height = "100%";
      targetsvg.style.width = "100%";
      if (
        targetBounds.width < svgBounds.width ||
        targetBounds.height < svgBounds.height
      ) {
        panSVG.resize();
      }
      panSVG.fit();
      panSVG.center();
      if (
        panZoom.size &&
        panZoom.size.width == targetsvg.width.baseVal.valueInSpecifiedUnits &&
        panZoom.size.height == targetsvg.height.baseVal.valueInSpecifiedUnits
      ) {
        panSVG.zoom(panZoom.zoom);
        panSVG.pan(panZoom.pan);
      }
    } catch (err) {
      console.log("display error", err);
      drawing = false;
    }
  } else {
    console.log("display: skipping", chosen);
  }
}
