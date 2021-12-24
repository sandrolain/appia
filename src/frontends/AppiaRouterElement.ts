import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { RouterSource } from "../router/RouterSource";
import { RouterHistorySource } from "../router/RouterHistorySource";
import { RouterHashSource } from "../router/RouterHashSource";
import { RouterVirtualSource } from "../router/RouterVirtualSource";
import { FrontendsManager } from "./FrontendsManager";
import { FrontendRoute, FrontendsRouter } from "./FrontendsRouter";
import { Router, RouterNavigation } from "../router/Router";

@customElement("appia-router")
export class AppiaRouterElement extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({
    type: String,
    attribute: true,
    reflect: true
  })
  source: "history" | "hash" | "virtual" = "history";

  @property({
    type: Array,
    attribute: false,
    reflect: false
  })
  routes: FrontendRoute[];

  @property({
    type: String,
    attribute: true,
    reflect: true
  })
  routesSrc: string;

  private router: FrontendsRouter;

  protected render (): TemplateResult {
    return html`<slot></slot>`;
  }

  connectedCallback (): void {
    super.connectedCallback();
    this.initRouter();
  }

  disconnectedCallback (): void {
    super.disconnectedCallback();
    this.teardownRouter();
  }

  private initRouter (): void {
    this.router = new FrontendsRouter(
      new Router(this.getRouterSource()),
      new FrontendsManager({
        container: this
      })
    );
    this.initRoutes();
  }

  private async initRoutes (): Promise<void>  {
    if(this.routes?.length > 0) {
      return this.addRoutes();
    }
    if(this.routesSrc) {
      const response = await fetch(this.routesSrc);
      this.routes = await response.json();
    }
  }

  private addRoutes (): void  {
    for(const route of this.routes) {
      this.router.addRoute(route);
    }
    this.router.checkCurrentPath();
  }

  private teardownRouter (): void {
    this.router.teardown();
  }

  private resetRoutes (): void {
    this.router.removeAllRoutes();
    this.initRoutes();
  }

  private getRouterSource (): RouterSource {
    if(this.source === "history") {
      return new RouterHistorySource();
    }
    if(this.source === "hash") {
      return new RouterHashSource();
    }
    return new RouterVirtualSource();
  }

  protected updated (_changedProperties: Map<string | number | symbol, unknown>): void {
    if(_changedProperties.has("source")) {
      this.teardownRouter();
      this.initRouter();
    } else if(_changedProperties.has("routes")) {
      this.resetRoutes();
    }
    super.updated(_changedProperties);
  }

  navigate (navigation: RouterNavigation): void {
    this.router.navigate(navigation);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "appia-router": AppiaRouterElement;
  }
}
