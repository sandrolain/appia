import { RouterSource } from "./RouterSource";

// TODO: test
// TODO: docs
export class RouterHistorySource extends RouterSource {
  getCurrentPath (): string {
    return location.pathname + location.search;
  }

  private listener: (event: PopStateEvent) => void;

  initDispatcher (): void {
    this.listener = (event): void => this.dispatch(event.state);
    window.addEventListener("popstate", this.listener);
  }

  public teardown (): void {
    window.removeEventListener("popstate", this.listener);
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
