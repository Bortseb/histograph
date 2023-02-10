document.addEventListener("click", (e) => {
  switch (e.target.id) {
    case "download-history":
      browser.runtime.sendMessage({ cmd: "download" });
      break;
    case "clear-history":
      browser.runtime.sendMessage({ cmd: "clear" });
      break;
    default:
      console.log("default case worked in histograph.js");
  }
});
