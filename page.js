const windowLocation = "" + window.location;
const tabID = browser.tabs.getCurrent();

//Add every link that is clicked on as a new node
window.addEventListener("click", (e) => {
  if (!e.target.closest("a")) {
    //console.log("no link clicked (e)", e);
    return;
  }
  const linkCLicked = e.target.closest("a").href;
  if (e.ctrlKey) {
    browser.runtime.sendMessage({
      cmd: "click",
      source: windowLocation,
      target: linkCLicked,
      type: "new",
      tabID: tabID,
    });
  } else {
    browser.runtime.sendMessage({
      cmd: "click",
      source: windowLocation,
      target: linkCLicked,
      type: "same",
      tabID: tabID,
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
    type: "new",
    tabID: tabID,
  });
});
