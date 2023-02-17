const windowLocation = "" + window.location;
//const tabID = browser.tabs.getCurrent()

//Add every link that is clicked on as a new node
/*window.addEventListener("click", (e) => {
  if (!e.target.closest("a")) {
    console.log("no link clicked");
    return;
  }

  const linkCLicked = e.target.closest("a").href;
  //console.log("link clicked",linkCLicked );
  if (!e.ctrlKey) {
    browser.runtime.sendMessage({
      cmd: "click",
      source: windowLocation,
      target: linkCLicked,
      type: "same tab",
    });
  }
});
*/

/*
window.addEventListener("auxclick", (e) => {
  console.log("Aux event", e)
  console.log("Link clicked is",e.target.closest("a").href)
});
*/
