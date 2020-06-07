import { RouterSource } from "./RouterSource";

// TODO: test
// TODO: docs
export class RouterVirtualSource extends RouterSource {

  // TODO: manage history sequence

  private actualPath: string = "/";
  private pathData: Map<string, { data: any; title: string }> = new Map();

  getCurrentPath (): string {
    return this.actualPath;
  }

  initDispatcher (): void {
    window.addEventListener("router:notify", () => {
      const { data } = this.pathData.get(this.getCurrentPath()) || {};
      this.dispatch(data);
    });
  }

  replaceState (data: any, title: string, fullPath: string): void {
    this.pathData.set(fullPath, { data, title });
    this.actualPath = fullPath;
    this.dispatch(data);
  }

  pushState (data: any, title: string, fullPath: string): void {
    this.pathData.set(fullPath, { data, title });
    this.actualPath = fullPath;
    this.dispatch(data);
  }
}
