import { Router } from "../dist/esm/index.js";

export function init (source) {
  const rout   = new Router(source);

  const basePath = window.location.pathname.replace(/\/$/, "");

  rout.addRoute({
    path: `${basePath}/path/to/:dest`,
    callback: (data) => {
      console.log("match", data);
      console.log("search", data.searchParams.get("foo"))
    },
    callbackUnmatch: (data) => {
      console.log("unmatch", data);
    }
  });

  rout.addRoute({
    path: `${basePath}/path/to/bbb`,
    callback: (data) => {
      console.log("bbb", data);
    },
    callbackUnmatch: (data) => {
      console.log("not bbb", data);
    }
  });

  document.addEventListener("click", (e) => {
    if(e.target.nodeName === "A") {
      e.preventDefault();
      rout.navigate({
        path: e.target.getAttribute("href")
      });
    }
  });

  rout.checkCurrentPath();

}
