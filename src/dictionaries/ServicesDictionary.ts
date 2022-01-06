import { AbstractDictionaryManager } from "./Dictionary";

export type ServicesDictionaryItem = string;

export class ServicesDictionaryManager extends AbstractDictionaryManager<ServicesDictionaryItem> {
  fetchLatest (key: string, init?: RequestInit): Promise<Response> {
    const url = this.getLatestItem(key);
    return window.fetch(url, init);
  }

  fetchVersion (key: string, version: string, init?: RequestInit): Promise<Response> {
    const url = this.getMatchingItem(key, version);
    return window.fetch(url, init);
  }
}
