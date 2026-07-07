import {
  Injectable,
  inject
} from '@angular/core';

import {
  MOCK_DB_STORAGE_KEYS,
  MockDbCollectionName
} from '../models/mock-db.types';

import { StorageService } from './storage';

interface EntityWithId {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDbService {

  private readonly storage =
    inject(StorageService);

  getAll<T>(
    collection: MockDbCollectionName
  ): T[] {
    const key =
      MOCK_DB_STORAGE_KEYS[collection];

    return this.storage.get<T[]>(key) ?? [];
  }

  getById<T extends EntityWithId>(
    collection: MockDbCollectionName,
    id: string
  ): T | null {
    return (
      this.getAll<T>(collection)
        .find(item => item.id === id)
      ?? null
    );
  }

  create<T extends EntityWithId>(
    collection: MockDbCollectionName,
    entity: T
  ): T {
    const items =
      this.getAll<T>(collection);

    if (
      items.some(
        item => item.id === entity.id
      )
    ) {
      throw new Error(
        `"${collection}" koleksiyonunda "${entity.id}" kimlikli kayıt zaten mevcut.`
      );
    }

    const updatedItems = [
      ...items,
      this.clone(entity)
    ];

    this.persist(
      collection,
      updatedItems
    );

    return this.clone(entity);
  }

  update<T extends EntityWithId>(
    collection: MockDbCollectionName,
    id: string,
    updater: (current: T) => T
  ): T {
    const items =
      this.getAll<T>(collection);

    const index =
      items.findIndex(
        item => item.id === id
      );

    if (index === -1) {
      throw new Error(
        `"${collection}" koleksiyonunda "${id}" kimlikli kayıt bulunamadı.`
      );
    }

    const current =
      this.clone(items[index]);

    const updated =
      updater(current);

    if (updated.id !== id) {
      throw new Error(
        'Güncelleme sırasında kayıt kimliği değiştirilemez.'
      );
    }

    const nextItems = [
      ...items
    ];

    nextItems[index] =
      this.clone(updated);

    this.persist(
      collection,
      nextItems
    );

    return this.clone(updated);
  }

  replace<T extends EntityWithId>(
    collection: MockDbCollectionName,
    id: string,
    entity: T
  ): T {
    return this.update<T>(
      collection,
      id,
      () => entity
    );
  }

  deleteById<T extends EntityWithId>(
    collection: MockDbCollectionName,
    id: string
  ): boolean {
    const items =
      this.getAll<T>(collection);

    const nextItems =
      items.filter(
        item => item.id !== id
      );

    if (
      nextItems.length === items.length
    ) {
      return false;
    }

    this.persist(
      collection,
      nextItems
    );

    return true;
  }

  query<T>(
    collection: MockDbCollectionName,
    predicate: (item: T) => boolean
  ): T[] {
    return this
      .getAll<T>(collection)
      .filter(predicate)
      .map(item => this.clone(item));
  }

  count(
    collection: MockDbCollectionName
  ): number {
    return this
      .getAll<unknown>(collection)
      .length;
  }

  exists<T>(
    collection: MockDbCollectionName,
    predicate: (item: T) => boolean
  ): boolean {
    return this
      .getAll<T>(collection)
      .some(predicate);
  }

  setAll<T>(
    collection: MockDbCollectionName,
    items: readonly T[]
  ): void {
    this.persist(
      collection,
      items.map(
        item => this.clone(item)
      )
    );
  }

  clearCollection(
    collection: MockDbCollectionName
  ): void {
    const key =
      MOCK_DB_STORAGE_KEYS[collection];

    this.storage.remove(key);
  }

  hasCollection(
    collection: MockDbCollectionName
  ): boolean {
    const key =
      MOCK_DB_STORAGE_KEYS[collection];

    return this.storage.has(key);
  }

  transaction<T>(
    operation: () => T
  ): T {
    const snapshot =
      this.createSnapshot();

    try {
      return operation();
    } catch (error) {
      this.restoreSnapshot(snapshot);
      throw error;
    }
  }

  private persist<T>(
    collection: MockDbCollectionName,
    items: readonly T[]
  ): void {
    const key =
      MOCK_DB_STORAGE_KEYS[collection];

    const success =
      this.storage.set(
        key,
        items
      );

    if (!success) {
      throw new Error(
        `"${collection}" koleksiyonu kaydedilemedi.`
      );
    }
  }

  private createSnapshot():
    Partial<Record<MockDbCollectionName, unknown[]>> {
    const snapshot:
      Partial<Record<MockDbCollectionName, unknown[]>> = {};

    const collections =
      Object.keys(
        MOCK_DB_STORAGE_KEYS
      ) as MockDbCollectionName[];

    for (const collection of collections) {
      if (
        this.hasCollection(collection)
      ) {
        snapshot[collection] =
          this.getAll<unknown>(collection);
      }
    }

    return snapshot;
  }

  private restoreSnapshot(
    snapshot:
      Partial<Record<MockDbCollectionName, unknown[]>>
  ): void {
    const collections =
      Object.keys(
        MOCK_DB_STORAGE_KEYS
      ) as MockDbCollectionName[];

    for (const collection of collections) {
      const previousValue =
        snapshot[collection];

      if (previousValue === undefined) {
        this.clearCollection(collection);
        continue;
      }

      this.setAll(
        collection,
        previousValue
      );
    }
  }

  private clone<T>(
    value: T
  ): T {
    if (
      typeof structuredClone === 'function'
    ) {
      return structuredClone(value);
    }

    return JSON.parse(
      JSON.stringify(value)
    ) as T;
  }
}
