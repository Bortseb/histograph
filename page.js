const windowLocation = "" + window.location;

//Add every link that is clicked on as a new node
window.addEventListener("click", (e) => {
  if (!e.target.closest("a")) {
    console.log("no link clicked (e)", e);
    return;
  }
  const linkCLicked = e.target.closest("a").href;
  if (e.ctrlKey) {
    browser.runtime.sendMessage({
      cmd: "click",
      source: windowLocation,
      target: linkCLicked,
      type: "new tab",
    });
  } else {
    browser.runtime.sendMessage({
      cmd: "click",
      source: windowLocation,
      target: linkCLicked,
      type: "same tab",
    });
  }
});

window.addEventListener("auxclick", (e) => {
  if (!e.target.closest("a")) {
    //console.log("no link clicked (e)", e);
    return;
  }
  const linkCLicked = e.target.closest("a").href;
  browser.runtime.sendMessage({
    cmd: "click",
    source: windowLocation,
    target: linkCLicked,
    type: "new tab",
  });
});
