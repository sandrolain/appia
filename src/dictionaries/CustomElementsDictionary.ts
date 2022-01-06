import { AssetsManager } from "../assets/AssetsManager";
import { AbstractDictionaryManager } from "./Dictionary";

export type CustomElementsItem = string;

export class CustomElementsDictionaryManager extends AbstractDictionaryManager<CustomElementsItem> {
  importLatest (key: string): Promise<boolean> {
    return AssetsManager.importModule(
      this.getLatestItem(key)
    );
  }

  importVersion (key: string, version: string): Promise<boolean> {
    return AssetsManager.importModule(
      this.getMatchingItem(key, version)
    );
  }
}
