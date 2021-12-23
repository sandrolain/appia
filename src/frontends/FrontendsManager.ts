export type FrontendHookName = "prepare" | "created";
export type FrontendHookCallback = (frontend: Frontend, el: HTMLElement) => any;
export type FrontendValidationCallback = () => boolean | Promise<boolean>;
export type FrontendImports = string[];
export type FrontendTarget = string | HTMLElement;

interface AbstractFrontend {
  target: FrontendTarget;
  hooks?: Record<FrontendHookName, FrontendHookCallback>;
  validate?: FrontendValidationCallback;
  imports?: FrontendImports;
  shadowed?: boolean;
}

interface ElementAttributes {
  attributes?: Record<string, string>;
  properties?: Record<string, any>;
  events?: Record<string, (event: Event) => any>
}

export interface ElementFrontend extends AbstractFrontend, ElementAttributes {
  type: "element";
  tagName: string;
}

export interface IframeFrontend extends AbstractFrontend, ElementAttributes {
  type: "iframe";
  src: string;
}

export interface HtmlFrontend extends AbstractFrontend, ElementAttributes {
  type: "html";
  src: string;
}

export type Frontend = ElementFrontend | IframeFrontend | HtmlFrontend;


export type FrontendManagerContainer = Document | HTMLElement;

export interface FrontendsManagerConfiguration {
  container: FrontendManagerContainer;
}

export class FrontendsManager {
  private config: FrontendsManagerConfiguration;
  private targetsFrontends: WeakMap<HTMLElement | ShadowRoot, HTMLElement> = new WeakMap();

  constructor (config: Partial<FrontendsManagerConfiguration> = {}) {
    this.config = {
      container: window.document,
      ...config
    };
  }

  private getContainer (): FrontendManagerContainer {
    return this.config.container;
  }

  private getTarget (frontend: Frontend): HTMLElement {
    if(frontend.target instanceof HTMLElement) {
      return frontend.target;
    }
    return this.getContainer().querySelector(frontend.target);
  }

  private getDocument (): Document {
    return this.getContainer().ownerDocument;
  }

  async applyFrontend (frontend: Frontend): Promise<HTMLElement> {
    const target = this.getTarget(frontend);
    if(!target) {
      throw new Error("Target not available");
    }

    let el: HTMLElement;

    this.callHook(el, frontend, "prepare");

    switch(frontend.type) {
    case "element": el = await this.applyElementFrontend(frontend, target); break;
    case "iframe": el = await this.applyIframeFrontend(frontend, target); break;
    case "html": el = await this.applyHtmlFrontend(frontend, target); break;
    }

    this.callHook(el, frontend, "created");
    return el;
  }

  private async applyElementFrontend (frontend: ElementFrontend, target: HTMLElement): Promise<HTMLElement> {
    const shadowedTarget = this.getShadowed(frontend, target);
    const el = this.getChachedChild(shadowedTarget, () => {
      return this.getDocument().createElement(frontend.tagName);
    });
    this.applyElementAttributes(el, frontend);
    this.setChild(shadowedTarget, el);
    return el;
  }

  private async applyHtmlFrontend (frontend: HtmlFrontend, target: HTMLElement): Promise<HTMLElement> {
    const shadowedTarget = this.getShadowed(frontend, target);
    const el = this.getChachedChild(shadowedTarget, () => {
      const div = this.getDocument().createElement("div");
      div.style.display = "contents";
      return div;
    });
    const response = await fetch(frontend.src);
    el.innerHTML = await response.text();
    this.applyElementAttributes(el, frontend);
    this.setChild(shadowedTarget, el);
    return el;
  }

  private async applyIframeFrontend (frontend: IframeFrontend, target: HTMLElement): Promise<HTMLElement> {
    const shadowedTarget = this.getShadowed(frontend, target);

    let el: HTMLIFrameElement;
    if(target instanceof HTMLIFrameElement) {
      el = target;
    } else if(shadowedTarget.firstElementChild instanceof HTMLIFrameElement) {
      el = shadowedTarget.firstElementChild;
    } else {
      el = this.getDocument().createElement("iframe");
      this.setChild(shadowedTarget, el);
    }

    el.setAttribute("src", frontend.src);
    this.applyElementAttributes(el, frontend);

    return el;
  }

  private getChachedChild (target: HTMLElement | ShadowRoot, cb: () => HTMLElement): HTMLElement {
    let el = this.targetsFrontends.get(target);
    if(!el) {
      el = cb();
      this.targetsFrontends.set(target, el);
    }
    return el;
  }

  private getShadowed (frontend: Frontend, target: HTMLElement): HTMLElement | ShadowRoot {
    if(frontend.shadowed) {
      if(target.shadowRoot) {
        return target.shadowRoot;
      }
      return target.attachShadow({
        mode: "open"
      });
    }
    return target;
  }

  private setChild (target: HTMLElement | ShadowRoot, child: HTMLElement): void {
    if(target.firstElementChild !== child) {
      target.textContent = "";
      target.appendChild(child);
    }
  }

  private applyElementAttributes (el: HTMLElement, attrs: ElementAttributes): void {
    if(attrs.attributes) {
      for(const [key, value] of Object.entries(attrs.attributes)) {
        el.setAttribute(key, value);
      }
    }
    if(attrs.properties) {
      for(const [key, value] of Object.entries(attrs.properties)) {
        (el as any)[key] = value;
      }
    }
    if(attrs.events) {
      for(const [key, value] of Object.entries(attrs.events)) {
        el.addEventListener(key, value);
      }
    }
  }

  private callHook (el: HTMLElement, frontend: Frontend, hookName: FrontendHookName): void {
    if(frontend.hooks?.[hookName]) {
      frontend.hooks[hookName](frontend, el);
    }
  }
}

