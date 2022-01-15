class MyOtherElement extends HTMLElement {
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
          background: red;
          color: yellow;
          text-align: center;
          transition: background-color 500ms ease;
        }
      </style>
      <b>This is the custom element &lt;my-other-element&gt;&lt;/my-other-element&gt;</b>
    `;
  }

  connectedCallback () {
    const colors = ["red", "blue", "green"];
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

window.customElements.define("my-other-element", MyOtherElement);
