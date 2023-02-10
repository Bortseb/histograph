//Add every link that is clicked on as a new node
window.addEventListener("click", (e) => {
  console.log("click event",e)
  if (!e.target.closest("a")) {
    return;
  }
  browser.runtime.sendMessage({ cmd: "click", curURL: window.location, curTitle: document.title, clickedURL: e.target.href });
});
