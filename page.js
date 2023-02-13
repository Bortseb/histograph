//Add every link that is clicked on as a new node
window.addEventListener("click", (e) => {
  //console.log("page.js click event",e)
  if (!e.target.closest("a")) {
    return;
  }
  if (e.ctrlKey) {
    browser.runtime.sendMessage({
      cmd: "click",
      curURL: window.location,
      curTitle: document.title,
      clickedURL: e.target.href,
      type: "new tab",
    });
  } else {
    browser.runtime.sendMessage({
      cmd: "click",
      curURL: window.location,
      curTitle: document.title,
      clickedURL: e.target.href,
      type: "same tab",
    });
  }
});

window.addEventListener("auxclick", (e) => {
  //console.log("page.js auxclick event",e)
  //console.log(`cmd: "click", curURL: window.location, curTitle: document.title, clickedURL: e.target.href `)
  if (!e.target.closest("a")) {
    return;
  }
  //middle click to open new tab
  if (e.button === 1) {
    browser.runtime.sendMessage({
      cmd: "click",
      curURL: window.location,
      curTitle: document.title,
      clickedURL: e.target.href,
      type: "new tab",
    });
  }
  //browser.runtime.sendMessage({ cmd: "click", curURL: "window.location", curTitle: document.title, clickedURL: e.target.href });
});
