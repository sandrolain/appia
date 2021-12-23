import { Router } from "./appia/index.js";
import { anchorsToRouterNavigation } from "./utils.js";

export function init (source): void {
  const rout     = new Router(source);

  rout.addRoute({
    path: `/path/to/:dest`,
    callback: (data) => {
      console.log("match", data);
      console.log("search", data.searchParams.get("foo"));
    },
    callbackUnmatch: (data) => {
      console.log("unmatch", data);
    }
  });

  rout.addRoute({
    path: `/path/to/bbb`,
    callback: (data) => {
      console.log("bbb", data);
    },
    callbackUnmatch: (data) => {
      console.log("not bbb", data);
    }
  });

  anchorsToRouterNavigation(rout);

  rout.checkCurrentPath();

}
