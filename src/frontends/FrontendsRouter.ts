import { Route, Router, RouterNavigation } from "../router/Router";
import { Frontend, FrontendsManager } from "./FrontendsManager";

export interface FrontendRoute {
  route: Route | string;
  frontends: Frontend[];
}

export class FrontendsRouter {
  constructor (
    private router: Router,
    private manager: FrontendsManager
  ) {

  }

  teardown (): void {
    this.router.teardown();
  }

  addRoutes (routes: FrontendRoute[]): void {
    for(const route of routes) {
      this.addRoute(route);
    }
  }

  addRoute (frontendRoute: FrontendRoute): void {
    const route: Route = (typeof frontendRoute.route === "string")  ? { path: frontendRoute.route } : frontendRoute.route;
    this.router.addRoute({
      ...route,
      callback: (info) => {
        for(const frontend of frontendRoute.frontends) {
          this.manager.applyFrontend(frontend);
        }
        if(route.callback) {
          route.callback(info);
        }
      }
      // TODO: unapply frontend ?
    });
  }

  removeAllRoutes (): void {
    return this.router.removeAllRoutes();
  }

  checkCurrentPath (): void {
    return this.router.checkCurrentPath();
  }

  navigate (navigation: RouterNavigation): void {
    return this.router.navigate(navigation);
  }
}