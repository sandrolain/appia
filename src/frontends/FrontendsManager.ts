import { AppiaFrontendElement } from "./AppiaFrontendElement";

export type FrontendHookName = "prepare" | "created";
export type FrontendHookCallback = (frontend: Frontend, el: HTMLElement) => any;
export type FrontendValidationCallback = () => boolean | Promise<boolean>;
export type FrontendImports = string[];
export type FrontendTarget = string | HTMLElement;

interface AbstractFrontend {
  target: FrontendTarget;
  extend?: string;
  hooks?: Record<FrontendHookName, FrontendHookCallback>;
  validate?: FrontendValidationCallback;
  assets?: {
    styles?: FrontendImports;
    scripts?: FrontendImports;
    modules?: FrontendImports;
  };
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

export interface IFrameFrontend extends AbstractFrontend, ElementAttributes {
  type: "iframe";
  src: string;
  adaptHeight?: boolean;
  scrolling?: boolean;
}

export interface HtmlFrontend extends AbstractFrontend, ElementAttributes {
  type: "html";
  src: string;
}

export interface EmptyFrontend extends AbstractFrontend, ElementAttributes {
  type: "empty";
}

export interface ExternalFrontend extends AbstractFrontend, ElementAttributes {
  type: "external";
  src: string;
}

export type Frontend = ElementFrontend | IFrameFrontend | HtmlFrontend | EmptyFrontend |ExternalFrontend;

export type FrontendConfigCallback = () => (Frontend | Promise<Frontend>);
export type FrontendConfig = Frontend | ExternalFrontend | FrontendConfigCallback;


export type FrontendManagerContainer = Document | HTMLElement;

export interface FrontendsManagerConfiguration {
  container: FrontendManagerContainer;
}

export class FrontendsManager {
  private static importedAssets = {
    styles: new Set(),
    scripts: new Set(),
    modules: new Set()
  };

  private static async importStyle (url: string): Promise<boolean> {
    if(this.importedAssets.styles.has(url)) {
      return false;
    }
    const style = this.createStyle(url);
    document.body.appendChild(style);
    this.importedAssets.styles.add(url);
    return true;
  }

  private static createStyle (url: string): HTMLStyleElement {
    const style = document.createElement("style");
    style.setAttribute("data-appia-style", url);
    style.innerHTML = `@import url("${url}");`;
    return style;
  }

  private static async importScript (url: string): Promise<boolean> {
    if(this.importedAssets.scripts.has(url)) {
      return false;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("data-appia-script", url);
      script.setAttribute("src", url);
      script.addEventListener("load", () => resolve(true));
      script.addEventListener("error", () => reject(new Error(`Cannot import script asset "${url}"`)));
      document.body.appendChild(script);
      this.importedAssets.scripts.add(url);
    });
  }

  private static async importModule (url: string): Promise<boolean> {
    if(this.importedAssets.modules.has(url)) {
      return false;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.setAttribute("type", "module");
      script.setAttribute("data-appia-script", url);
      script.setAttribute("src", url);
      script.addEventListener("load", () => resolve(true));
      script.addEventListener("error", () => reject(new Error(`Cannot import module asset "${url}"`)));
      document.body.appendChild(script);
      this.importedAssets.modules.add(url);
    });
  }

  private static importAssets (frontend: Frontend): HTMLStyleElement[] {
    const result: HTMLStyleElement[] = [];
    if(frontend.assets?.scripts) {
      for(const url of frontend.assets.scripts) {
        this.importScript(url);
      }
    }
    if(frontend.assets?.modules) {
      for(const url of frontend.assets.modules) {
        this.importModule(url);
      }
    }
    if(frontend.assets?.styles) {
      for(const url of frontend.assets.styles) {
        if(frontend.shadowed) {
          result.push(this.createStyle(url));
        } else {
          this.importStyle(url);
        }
      }
    }
    return result;
  }

  private static externalFrontends: Map<string, Frontend> = new Map();

  private static async getExternalFrontend (src: string): Promise<Frontend> {
    if(this.externalFrontends.has(src)) {
      return this.externalFrontends.get(src);
    }
    const response         = await fetch(src);
    const externalFrontend = await response.json() as Frontend;
    this.externalFrontends.set(src, externalFrontend);
    return externalFrontend;
  }

  private config: FrontendsManagerConfiguration;
  private targetsFrontends: WeakMap<HTMLElement, AppiaFrontendElement> = new WeakMap();

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

  async applyFrontend (frontendConfig: FrontendConfig): Promise<HTMLElement> {
    const frontend = (typeof frontendConfig === "function") ? await frontendConfig() : frontendConfig;
    this.callHook(null, frontend, "prepare");
    const el = await  this.applyFrontendType(frontend);
    this.callHook(el, frontend, "created");
    return el;
  }

  private async applyFrontendType (frontend: Frontend): Promise<HTMLElement> {
    const target = this.getTarget(frontend);
    if(!target) {
      throw new Error("Target not available");
    }

    let el: HTMLElement;

    if(frontend.extend) {
      const externalFrontend = await FrontendsManager.getExternalFrontend(frontend.extend);
      frontend = {
        ...externalFrontend,
        ...{
          ...frontend,
          extend: undefined
        }
      };
    }

    switch(frontend.type) {
    case "element": el = await this.applyElementFrontend(frontend, target); break;
    case "iframe": el = await this.applyIFrameFrontend(frontend, target); break;
    case "html": el = await this.applyHtmlFrontend(frontend, target); break;
    case "empty": el = await this.applyEmptyFrontend(frontend, target); break;
    case "external": el = await this.applyExternalFrontend(frontend); break;
    }
    return el;
  }

  private async applyExternalFrontend (frontend: ExternalFrontend): Promise<HTMLElement> {
    const externalFrontend = await FrontendsManager.getExternalFrontend(frontend.src);

    const frontendCopy = { ...frontend };
    delete frontendCopy.type;
    delete frontendCopy.src;

    return this.applyFrontendType({
      ...externalFrontend,
      ...frontendCopy
    });
  }

  private async applyEmptyFrontend (frontend: EmptyFrontend, target: HTMLElement): Promise<HTMLElement> {
    const feEl = this.getChachedChild(target);
    if(feEl.isChanged(frontend)) {
      const styles = FrontendsManager.importAssets(frontend);
      feEl.setChild(frontend, styles);
    }
    return feEl;
  }

  private async applyElementFrontend (frontend: ElementFrontend, target: HTMLElement): Promise<HTMLElement> {
    const feEl = this.getChachedChild(target);
    if(feEl.isChanged(frontend)) {
      const styles = FrontendsManager.importAssets(frontend);
      const el = this.getDocument().createElement(frontend.tagName);
      this.applyElementAttributes(el, frontend);
      feEl.setChild(frontend, styles, el);
    }
    return feEl;
  }

  private async applyHtmlFrontend (frontend: HtmlFrontend, target: HTMLElement): Promise<HTMLElement> {
    const feEl = this.getChachedChild(target);
    if(feEl.isChanged(frontend)) {
      const styles   = FrontendsManager.importAssets(frontend);
      const response = await fetch(frontend.src);
      const html     = await response.text();
      feEl.setHTML(frontend, styles, html);
    }
    return feEl;
  }

  private async applyIFrameFrontend (frontend: IFrameFrontend, target: HTMLElement): Promise<HTMLElement> {
    if(target instanceof HTMLIFrameElement) {
      FrontendsManager.importAssets(frontend);
      const el = target;
      el.setAttribute("src", frontend.src);
      this.applyElementAttributes(el, frontend);
      this.adaptIFrame(frontend, el);
      return el;
    }

    const feEl = this.getChachedChild(target);
    if(feEl.isChanged(frontend)) {
      const styles = FrontendsManager.importAssets(frontend);
      const el = this.getDocument().createElement("iframe");
      feEl.setChild(frontend, styles, el);
      el.setAttribute("src", frontend.src);
      this.applyElementAttributes(el, frontend);
      this.adaptIFrame(frontend, el);
    }
    return feEl;
  }

  private adaptIFrame (frontend: IFrameFrontend, iframe: HTMLIFrameElement): void {
    if(!frontend.scrolling) {
      iframe.style.overflow = "hidden";
      iframe.scrolling = "no";
    }
    if(frontend.adaptHeight) {
      iframe.style.height = null;
      iframe.style.minHeight = "0";
      const adapt = (): void => {
        try {
          const height = Math.max(
            iframe.contentWindow.document.body.scrollHeight,
            iframe.contentWindow.document.documentElement.offsetHeight
          );
          iframe.style.height = `${height}px`;
        } catch(e) {
          //
        }
      };
      if(iframe.contentWindow?.document.readyState === "complete") {
        adapt();
      }
      iframe.addEventListener("load", adapt);
    }
  }

  private getChachedChild (target: HTMLElement): AppiaFrontendElement {
    let el = this.targetsFrontends.get(target);
    if(!el) {
      el = document.createElement("appia-frontend");
      target.appendChild(el);
      this.targetsFrontends.set(target, el);
    }
    return el;
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

