import { RouterSource } from "./RouterSource";

// TODO: test
// TODO: docs
export class RouterHistorySource extends RouterSource {

  getCurrentPath (): string {
    return location.pathname + location.search;
  }

  initDispatcher (): void {
    window.addEventListener("popstate", (e) => this.dispatch(e.state));
  }

  replaceState (data: any, title: string, path: string): void {
    history.replaceState(data, title, path);
    this.dispatch(data);
  }

  pushState (data: any, title: string, path: string): void {
    history.pushState(data, title, path);
    this.dispatch(data);
  }
}
