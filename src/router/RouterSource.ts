
export type RouterSourceListener = (path: string, state: any) => void;

export abstract class RouterSource {

  protected listeners: RouterSourceListener[] = [];

  constructor () {
    this.initDispatcher();
  }

  dispatch (data: any): void {
    const path = this.getCurrentPath();
    for(const fn of this.listeners) {
      fn(path, data);
    }
  }

  listen (listener: RouterSourceListener): void {
    this.listeners.push(listener);
  }

  unlisten (listener: RouterSourceListener): void {
    this.listeners = this.listeners.filter((cb) => (cb !== listener));
  }

  protected abstract initDispatcher (): void;

  public abstract teardown (): void;

  // TODO: docs
  public abstract getCurrentPath (): string;

  // TODO: docs
  public abstract replaceState(data: any, title: string, fullPath: string): void;

  // TODO: docs
  public abstract pushState(data: any, title: string, fullPath: string): void;

  cleanPath (path: string): string {
    if(path.includes(":/")) {
      const url = new URL(path, window.location.href);
      return url.pathname + url.search;
    }
    return path;
  }
}
