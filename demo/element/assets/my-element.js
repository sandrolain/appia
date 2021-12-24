class MyElement extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({
      mode: "open"
    });
    this.shadowRoot.innerHTML = /*html*/`
      <style>
        :host {
          display: block;
          padding: 10px;
          border-radius: 5px;
          background: darkred;
          color: white;
          text-align: center;
        }
      </style>
      <b>This is the custom element &lt;my-element&gt;&lt;/my-element&gt;</b>
    `;
  }

  connectedCallback () {
    const colors = ["darkred", "darkblue", "darkgreen"];
    let i = 0;
    this.to = window.setInterval(() => {
      i++;
      this.style.backgroundColor = colors[i % colors.length];
    }, 1000);
  }

  disconnectedCallback () {
    window.clearInterval(this.to);
  }
}

window.customElements.define("my-element", MyElement);
