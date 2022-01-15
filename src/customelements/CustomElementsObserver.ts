import { CustomElementsDictionaryManager } from "../dictionaries/CustomElementsDictionary";

export class CustomElementsObserver {
  static readonly VERSION_ATTRIBUTE = "v";

  private observer: MutationObserver;
  private resolved: Set<string> = new Set();

  constructor (
    private target: Node,
    private dictionary: CustomElementsDictionaryManager
  ) {
    this.checkInitialTree();
    this.initObserver();
  }

  private checkInitialTree (): void {
    document.querySelectorAll("*").forEach((node) => this.resolveElement(node));
  }

  private initObserver (): void {
    this.observer = new MutationObserver((mutations) => {
      for(const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          this.resolveElement(node);
        });
      }
    });

    this.observer.observe(this.target, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree:true
    });
  }

  private async resolveElement (node: Node): Promise<boolean> {
    if(!(node instanceof HTMLElement)) {
      return false;
    }

    const tagName = node.tagName.toLowerCase();

    if(tagName.indexOf("-") < 0) {
      return false;
    }

    if(this.resolved.has(tagName)) {
      return false;
    }

    this.resolved.add(tagName);

    const version = node.getAttribute(CustomElementsObserver.VERSION_ATTRIBUTE);

    if(version) {
      return this.dictionary.importVersion(tagName, version);
    }

    return this.dictionary.importLatest(tagName);
  }
}
