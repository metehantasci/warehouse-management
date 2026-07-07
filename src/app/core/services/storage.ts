import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  get<T>(key: string): T | null {
    try {
      const rawValue = localStorage.getItem(key);

      if (rawValue === null) {
        return null;
      }

      return JSON.parse(rawValue) as T;
    } catch (error) {
      console.error(
        `[StorageService] "${key}" anahtarı okunamadı.`,
        error
      );

      return null;
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.error(
        `[StorageService] "${key}" anahtarı yazılamadı.`,
        error
      );

      return false;
    }
  }

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(
        `[StorageService] "${key}" anahtarı silinemedi.`,
        error
      );

      return false;
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  clearByPrefix(prefix: string): void {
    try {
      const keysToRemove: string[] = [];

      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);

        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(
        `[StorageService] "${prefix}" prefix temizlenemedi.`,
        error
      );
    }
  }
}
