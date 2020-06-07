import { getPathMatcher, PathMatcherFunction } from "htna-tools/dist/esm/url";
import { RouterSource } from "./RouterSource";

// TODO: docs
export interface Route {
  path: string;
  caseInsensitive?: boolean;
  callback: RouteCallback;
  callbackUnmatch?: RouteCallback;
}

// TODO: docs
export interface RouteCallbackInfo {
  match: boolean;
  path: string;
  routePath: string;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  data: any;
}

// TODO: docs
export type RouteCallback = (info: RouteCallbackInfo) => any;

type RouteItem = Route & {
  matcher: PathMatcherFunction;
}

// TODO: docs
// TODO: test
export class Router {
  private routes: RouteItem[] = [];
  private root: string = "";

  constructor (private source: RouterSource) {
    this.listen();
  }

  // TODO: docs
  // TODO: test
  setRoot (root: string = ""): void {
    this.root = this.cleanSlashes(root);
  }

  getRoot (): string {
    return this.root;
  }

  private cleanSlashes (path: string): string {
    return path.replace(/\/$/, "");
  }

  private getPath (fullPath: string): string {
    return this.cleanSlashes(decodeURI(fullPath))
      .replace(/\?(.*)$/, "")
      .replace(new RegExp(`^${this.root}`), "");
  }

  private getSearch (fullPath: string): string {
    return decodeURI(fullPath).split("?")[1] || "";
  }

  private getCurrentPath (): string {
    return this.getPath(this.source.getCurrentPath());
  }

  addRoutes (routes: Route[]): void {
    for(const route of routes) {
      this.addRoute(route);
    }
  }

  addRoute (route: Route): void {
    const { path, caseInsensitive } = route;
    const routeItem: RouteItem = {
      ...route,
      matcher: getPathMatcher(path, caseInsensitive)
    };
    this.routes.push(routeItem);
  }

  removeRoute (path: string): void {
    this.routes = this.routes.filter((route) => (route.path !== path));
  }

  check (fullPath: string, data: any): void {
    // TODO: verify if inside root
    // TODO: callback exit
    const path   = this.getPath(fullPath);
    const search = this.getSearch(fullPath);
    for(const route of this.routes.values()) {
      const routePath = route.path;
      const params = route.matcher(path);
      if(params) {
        route.callback({
          match: true,
          path,
          routePath,
          params,
          searchParams: new URLSearchParams(search),
          data
        });
      } else if(route.callbackUnmatch) {
        route.callbackUnmatch({
          match: false,
          path,
          routePath,
          params: null,
          searchParams: new URLSearchParams(search),
          data
        });
      }
    }
  }

  checkCurrentPath (data?: any): void {
    this.check(this.source.getCurrentPath(), data);
  }

  listen (): void {
    this.source.listen((data: any) => {
      this.checkCurrentPath(data);
    });
  }

  getFullPath (path: string): string {
    return this.root + this.cleanSlashes(path || "");
  }

  isCurrentPath (path: string): boolean {
    path = this.source.cleanPath(path);
    path = this.cleanSlashes(path || "");

    const actPath = this.getCurrentPath();

    return (actPath === path);
  }

  navigate (destination: {path: string; title?: string; data?: any} | string): void {
    if(typeof destination === "string") {
      destination = { path: destination };
    }

    // eslint-disable-next-line prefer-const
    let { path, title, data } = destination;

    path = this.source.cleanPath(path);
    path = this.cleanSlashes(path || "");

    if(!data) {
      data = { path, title };
    }

    if(this.isCurrentPath(path)) {
      this.source.replaceState(data, title, path);
    } else {
      this.source.pushState(data, title, path);
    }
  }
}
