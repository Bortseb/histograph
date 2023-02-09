//This script is put into every page the browser lands on
const channel = new BroadcastChannel("histograph");

document.addEventListener("click", (e) => {
  //e.preventDefault()
  console.log('Events from page.js',e)
  window.postMessage({ cmd: "request download" }, "*");
  if (e.target.closest("a")) { //If the click target has a parent that is an anchor
    let url = e.target.closest("a").href
    console.log(url); //return that anchor href
    //channel.postMessage({ cmd: "add" });
  }
});
