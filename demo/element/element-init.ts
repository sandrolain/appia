import "../appia/index.js";
import { anchorsToRouterNavigation } from "../utils.js";

const router = document.querySelector("appia-router");
router.source = "hash";
router.routes = [
  {
    route: "/route/one",
    frontends: [{
      type: "iframe",
      target: "#left",
      src: "/element/assets/frame-red.html"
    }, {
      type: "empty",
      target: "#right"
    }]
  },
  {
    route: "/route/two",
    frontends: [{
      type: "iframe",
      target: "#right",
      src: "/element/assets/frame-blue.html",
      assets: {
        styles: [
          "/element/assets/frame-blue.css"
        ]
      },
      shadowed: true
    }]
  },
  {
    route: "/route/three",
    frontends: [{
      type: "iframe",
      target: "#left",
      src: "/element/assets/frame-blue.html"
    }]
  }
];

anchorsToRouterNavigation(router);
