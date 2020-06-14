import { getPathMatcher, PathMatcherFunction, PathParams } from "htna-tools/dist/esm/url";
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
  routePath: string;
  match: boolean;
  params: PathParams;
  pathname: string;
  search: string;
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

  constructor (private source: RouterSource) {
    this.listen();
  }

  private parsePath (fullPath: string): { pathname: string; search: string } {
    const parts = fullPath.split("?");
    return {
      pathname: parts[0],
      search: parts[1] ? `?${parts[1]}` : ""
    };
  }

  private getCurrentPath (): string {
    return this.source.getCurrentPath();
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

  listen (): void {
    this.source.listen((path: string, data: any) => this.check(path, data));
  }

  private check (fullPath: string, data: any): void {
    // TODO: verify if inside root
    // TODO: callback exit
    const { pathname, search } = this.parsePath(fullPath);
    for(const route of this.routes.values()) {
      const routePath = route.path;
      const params    = route.matcher(pathname);
      if(params) {
        route.callback({
          match: true,
          pathname,
          routePath,
          params,
          search,
          searchParams: new URLSearchParams(search),
          data
        });
      } else if(route.callbackUnmatch) {
        route.callbackUnmatch({
          match: false,
          pathname,
          routePath,
          params: null,
          search,
          searchParams: new URLSearchParams(search),
          data
        });
      }
    }
  }

  checkCurrentPath (): void {
    this.check(this.source.getCurrentPath(), null);
  }

  navigate ({ path, title, data }: { path: string; title?: string; data?: any }): void {
    path = this.source.cleanPath(path);
    if(path === this.getCurrentPath()) {
      this.source.replaceState(data, title, path);
    } else {
      this.source.pushState(data, title, path);
    }
  }

  isCurrentPath (path: string, caseInsensitive: boolean = false): { pathname: string; params: PathParams; searchParams: URLSearchParams } | false {
    const { pathname, search } = this.parsePath(this.getCurrentPath());
    const matcher = getPathMatcher(path, caseInsensitive);
    const params  = matcher(pathname);
    if(params) {
      return {
        pathname,
        params,
        searchParams: new URLSearchParams(search)
      };
    }
    return false;
  }
}
