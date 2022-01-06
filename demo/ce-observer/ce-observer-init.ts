
import { CustomElementsDictionaryManager, CustomElementsObserver } from "../appia/index.js";

const observer = new CustomElementsObserver(document.body, new CustomElementsDictionaryManager({
  "my-element": {
    "1.0.0": "/element/assets/my-element.js"
  }
}));

