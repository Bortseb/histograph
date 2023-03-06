document.addEventListener("click", (e) => {
  switch (e.target.id) {
    case "download-history":
      browser.runtime.sendMessage({ cmd: "download" });
      break;
    case "clear-history":
      browser.runtime.sendMessage({ cmd: "clear" });
      break;
    case "switch":
      browser.runtime.sendMessage({ cmd: "change tab" });
      break;
    case "collaborator":
        browser.runtime.sendMessage({ cmd: "collaborator" });
        break;
    default:
      console.log("default case worked in background.js");
  }
});
