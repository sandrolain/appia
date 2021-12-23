import { RouterSource } from "./RouterSource";

// TODO: test
// TODO: docs
export class RouterHashSource extends RouterSource {

  private pathData: Map<string, { data: any; title: string }> = new Map();

  getCurrentPath (): string {
    return location.hash.replace(/^[^/]+/, "");
  }

  private listener: () => void;

  initDispatcher (): void {
    this.listener = (): void => {
      const { data } = this.pathData.get(this.getCurrentPath()) || {};
      this.dispatch(data);
    };
    window.addEventListener("hashchange", this.listener);
  }

  public teardown (): void {
    window.removeEventListener("hashchange", this.listener);
  }

  replaceState (data: any, title: string, fullPath: string): void {
    this.pathData.set(fullPath, { data, title });
    location.hash = `#!${fullPath}`;
  }

  pushState (data: any, title: string, fullPath: string): void {
    this.pathData.set(fullPath, { data, title });
    location.hash = `#!${fullPath}`;
  }

  cleanPath (path: string): string {
    if(path.includes(":/") || path.includes("#")) {
      const url = new URL(path, window.location.href);
      return url.hash.replace(/^[#!]+/, "");
    }
    return path;
  }
}
