//This script is put into every page the browser lands on


document.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    //console.log(e.target.href); //url
    console.log(e);
  }
});

