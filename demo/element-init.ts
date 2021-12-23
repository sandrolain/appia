import "./appia/index.js";
import { anchorsToRouterNavigation } from "./utils.js";

const router = document.querySelector("appia-router");
router.source = "hash";
router.routes = [
  {
    route: "/route/one",
    frontends: [{
      type: "iframe",
      target: "#left",
      src: "/index.html"
    }]
  },
  {
    route: "/route/two",
    frontends: [{
      type: "iframe",
      target: "#right",
      src: "/index.html",
      shadowed: true
    }]
  },
  {
    route: "/route/three",
    frontends: [{
      type: "iframe",
      target: "#left",
      src: "/element.html"
    }]
  }
];

anchorsToRouterNavigation(router);
