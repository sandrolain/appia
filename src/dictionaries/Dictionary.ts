import compareVersions, { satisfies } from "compare-versions";

export type DictionaryVoice<T> = Record<string, T>;
export type Dictionary<T> = Record<string, DictionaryVoice<T>>;

export abstract class AbstractDictionaryManager<T> {
  constructor (
    protected dictionary: Dictionary<T> = {}
  ) {}

  setDictionary (dictionary: Dictionary<T>): void {
    this.dictionary = dictionary;
  }

  setDictionaryVoice (key: string, voice: DictionaryVoice<T>): void {
    this.dictionary[key] = voice;
  }

  async loadDictionary (url: string): Promise<void> {
    const response = await fetch(url);
    this.dictionary = await response.json() as Dictionary<T>;
  }

  protected getMatchingVersion (versionsMap: DictionaryVoice<T>, match: string): string {
    if(versionsMap) {
      const versions = Object.keys(versionsMap);
      versions.sort((a, b) => -compareVersions(a, b)).shift();
      for(const version of versions) {
        if(satisfies(version, match)) {
          return version;
        }
      }
    }
    return null;
  }

  protected getLatestVersion (versionsMap: DictionaryVoice<T>): string {
    if(versionsMap) {
      const versions = Object.keys(versionsMap);
      if(versions.length > 1) {
        versions.sort((a, b) => -compareVersions(a, b)).shift();
      }
      return versions.shift();
    }
    return null;
  }

  getMatchingItem (key: string, match: string): T | null {
    const versionsMap   = this.dictionary?.[key];
    const latestVersion = this.getMatchingVersion(versionsMap, match);
    return latestVersion ? versionsMap[latestVersion] : null;
  }

  getLatestItem (key: string): T | null {
    const versionsMap   = this.dictionary?.[key];
    const latestVersion = this.getLatestVersion(versionsMap);
    return latestVersion ? versionsMap[latestVersion] : null;
  }
}
