import type { AppiaRouter, FrontendsRouter, Router } from "./appia";

export function anchorsToRouterNavigation (rout: Router | FrontendsRouter | AppiaRouter): void {
  document.addEventListener("click", (e: Event) => {
    if(e.target instanceof HTMLAnchorElement) {
      e.preventDefault();
      rout.navigate({
        path: e.target.getAttribute("href")
      });
    }
  });
}
