document.addEventListener("click", (e) => {
  switch (e.target.id) {
    case "download-history":
      browser.runtime.sendMessage({ cmd: "download" });
      break;
    case "clear-history":
      browser.runtime.sendMessage({ cmd: "clear" });
      break;
    case "switch":
      const tabID = document.getElementById("tabID").Value;
      console.log("sending message for tabID",tabID )
      browser.runtime.sendMessage({ cmd: "change tab", tabID: tabID });
      break;
    case "collaborator":
      browser.runtime.sendMessage({ cmd: "collaborator" });
      break;
    default:
      console.log("default case worked in background.js");
  }
});
