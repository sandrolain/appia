
import { CustomElementsDictionaryManager, CustomElementsObserver } from "../appia/index.js";

const observer = new CustomElementsObserver(document.body, new CustomElementsDictionaryManager({
  "my-element": {
    "1.0.0": "/element/assets/my-element.js",
    "2.0.0": "/element/assets/my-element.js"
  },
  "my-other-element": {
    "1.0.0": "/element/assets/my-other-element.js"
  }
}));

document.querySelector("my-element").addEventListener("click", () => {
  document.body.appendChild(document.createElement("my-other-element"));
});
