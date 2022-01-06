
export class AssetsManager {
  private static importedAssets = {
    styles: new Set(),
    scripts: new Set(),
    modules: new Set()
  };

  public static async importStyle (url: string): Promise<boolean> {
    if(this.importedAssets.styles.has(url)) {
      return false;
    }
    const style = this.createStyle(url);
    document.body.appendChild(style);
    this.importedAssets.styles.add(url);
    return true;
  }

  public static createStyle (url: string): HTMLStyleElement {
    const style = document.createElement("style");
    style.setAttribute("data-appia-style", url);
    style.innerHTML = `@import url("${url}");`;
    return style;
  }

  public static async importScript (url: string): Promise<boolean> {
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

  public static async importModule (url: string): Promise<boolean> {
    if(!url) {
      return false;
    }
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
}
