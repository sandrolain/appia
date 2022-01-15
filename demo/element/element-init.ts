import "../appia/index.js";
import { ExternalFrontend, Frontend, FrontendConfig } from "../appia/index.js";
import { anchorsToRouterNavigation } from "../utils.js";

const router = document.querySelector("appia-router");
router.source = "hash";
router.routes = [
  {
    route: "/route/one",
    frontends: async (): Promise<FrontendConfig[]> => [{
      type: "iframe",
      target: "#left",
      src: "/element/assets/frame-red.html",
      adaptHeight: true
    }, {
      type: "empty",
      target: "#right"
    }]
  },
  {
    route: "/route/two",
    frontends: [{
      type: "iframe",
      target: "#left",
      src: "/element/assets/frame-red.html"
    }, {
      type: "external",
      target: "#right",
      src: "/element/assets/frame-blue.json",
      adaptHeight: true
    } as ExternalFrontend]
  },
  {
    route: "/route/three",
    frontends: [{
      type: "iframe",
      target: "#left",
      src: "/element/assets/frame-blue.html"
    }, {
      type: "iframe",
      target: "#right",
      src: "data:text/plain;,Text from data-src"
    }]
  },
  {
    route: "/route/four",
    frontends: [{
      type: "element",
      target: "#left",
      assets: {
        modules: [
          "/element/assets/my-element.js"
        ]
      },
      tagName: "my-element"
    }, async (): Promise<Frontend> => ({
      type: "html",
      target: "#right",
      shadowed: true,
      src: "/element/assets/html-fragment.html"
    })]
  },
  {
    route: "/route/five",
    frontends: [{
      type: "template",
      target: "#left",
      template: "#tpl"
    }, async (): Promise<Frontend> => ({
      type: "html",
      target: "#right",
      shadowed: true,
      src: "/element/assets/html-fragment.html"
    })]
  }
];

anchorsToRouterNavigation(router);
