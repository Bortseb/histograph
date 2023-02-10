//Add every link that is clicked on as a new node
window.addEventListener("click", (e) => {
  if (!e.target.closest("a")) {
    return;
  }
  browser.runtime.sendMessage({ cmd: "addNode", url: e.target.href });
});
