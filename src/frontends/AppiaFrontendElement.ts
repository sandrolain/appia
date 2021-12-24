import { deepEqual } from "fast-equals";
import { Frontend } from "./FrontendsManager";

export class AppiaFrontendElement extends HTMLElement {
  private $slot: HTMLSlotElement;
  private $style: HTMLStyleElement;
  private frontend: Frontend;

  constructor () {
    super();
    this.attachShadow({
      mode: "open"
    });
    this.$style = document.createElement("style");
    this.$style.innerHTML = `
      :host {
        display: contents;
      }
    `;
    this.$slot = document.createElement("slot");
    this.shadowRoot.appendChild(this.$style);
    this.shadowRoot.appendChild(this.$slot);
  }

  isChanged (frontend: Frontend): boolean {
    return (!this.frontend || !deepEqual(this.frontend, frontend));
  }

  setChild (frontend: Frontend, styles: HTMLStyleElement[], child?: HTMLElement | DocumentFragment): void {
    this.shadowRoot.textContent = "";
    this.textContent = "";
    if(frontend.shadowed) {
      this.shadowRoot.appendChild(this.$style);
      for(const style of styles) {
        this.shadowRoot.appendChild(style);
      }
      if(child) {
        this.shadowRoot.appendChild(child);
      }
    } else {
      this.shadowRoot.appendChild(this.$style);
      this.shadowRoot.appendChild(this.$slot);
      if(child) {
        this.appendChild(child);
      }
    }
    this.frontend = frontend;
  }

  setHTML (frontend: Frontend, styles: HTMLStyleElement[], html: string): void {
    const template = document.createElement("template");
    template.innerHTML = html;
    this.setChild(frontend, styles, template.content);
  }
}

window.customElements.define("appia-frontend", AppiaFrontendElement);

declare global {
  interface HTMLElementTagNameMap {
    "appia-frontend": AppiaFrontendElement;
  }
}
