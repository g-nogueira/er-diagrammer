import { fromEvent, map } from "rxjs";
import events from "../constants/events";



type StorageEvent = {
  key: string;
  newValue: string;
  oldValue: string;
  storageArea: Storage;
};

function dispatchEvent(detail: StorageEvent) {
      window.dispatchEvent(new CustomEvent<StorageEvent>(events.storage, { detail: detail }));
}

export const AppStorage = {
  setItem(keyName: string, keyValue: string) {
    
    let oldItem = localStorage.getItem(keyName);
    
    localStorage.setItem(keyName, keyValue);
    
    dispatchEvent({
      key: keyName,
      newValue: keyValue,
      oldValue: oldItem || "",
      storageArea: window.localStorage,
    });
  },
  getItem(keyName : string) {
    return localStorage.getItem(keyName);
  },
  removeItem(keyName : string) {
    let oldItem = localStorage.getItem(keyName);

    localStorage.removeItem(keyName);

    dispatchEvent({
      key: keyName,
      newValue: "",
      oldValue: oldItem || "",
      storageArea: window.localStorage,
    });
  },
  observable : fromEvent<CustomEvent<StorageEvent>>(window, events.storage).pipe(map((ev) => ev.detail))
};
