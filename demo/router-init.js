import { Router } from "../dist/esm/index.js";

export function init (source) {
  const rout   = new Router(source);

  rout.setRoot("/path");

  rout.addRoute({
    path: "/to/:dest",
    callback: (data) => {
      console.log("match", data);
    },
    callbackUnmatch: (data) => {
      console.log("unmatch", data);
    }
  });

  rout.addRoute({
    path: "/to/bbb",
    callback: (data) => {
      console.log("bbb", data);
    },
    callbackUnmatch: (data) => {
      console.log("not bbb", data);
    }
  });

  document.querySelectorAll("a").forEach(($a) => {
    $a.addEventListener("click", (e) => {
      e.preventDefault();
      rout.navigate($a.getAttribute("href"));
    });
  });

  rout.checkCurrentPath();

}
