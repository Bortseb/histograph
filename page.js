//Add every link that is clicked on as a new node
window.addEventListener("click", (e) => {
  console.log("page.js click event",e)
  if (!(e.target.closest("a"))) {
    return;
  }
  browser.runtime.sendMessage({ cmd: "click", curURL: "window.location", curTitle: document.title, clickedURL: e.target.href });
});

window.addEventListener("auxclick", (e) => {
  console.log("page.js auxclick event",e)
  console.log(`cmd: "click", curURL: window.location, curTitle: document.title, clickedURL: e.target.href `)
  if (!(e.target.closest("a"))) {
    return;
  }
  browser.runtime.sendMessage({ cmd: "click", curURL: "window.location", curTitle: document.title, clickedURL: e.target.href });
});
