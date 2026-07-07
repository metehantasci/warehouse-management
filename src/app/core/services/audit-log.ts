import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  AuditActionType
} from '../models/audit-action-type.enum';

import {
  UserRole
} from '../models/user-role.enum';

import {
  AuditLogEntry
} from '../../features/audit-log/models/audit-log-entry';

import {
  AuthService
} from './auth';

import {
  IdGeneratorService
} from './id-generator';

import {
  MockDbService
} from './mock-db';

export interface AuditActor {
  userId: string;
  userName: string;
  userRole: UserRole;
}

export interface CreateAuditLogInput {
  action: AuditActionType;
  entityType: string;
  entityId: string;
  description: string;
  oldValue?: unknown;
  newValue?: unknown;
  actor?: AuditActor;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  private readonly authService =
    inject(AuthService);

  private readonly idGenerator =
    inject(IdGeneratorService);

  private readonly db =
    inject(MockDbService);

  private readonly maxEntries = 500;

  private readonly entriesState =
    signal<AuditLogEntry[]>(
      this.loadEntries()
    );

  readonly entries =
    this.entriesState.asReadonly();

  readonly totalCount =
    computed(
      () => this.entriesState().length
    );

  readonly newestFirst =
    computed(() =>
      [...this.entriesState()]
        .sort(
          (first, second) =>
            new Date(
              second.timestamp
            ).getTime()
            -
            new Date(
              first.timestamp
            ).getTime()
        )
    );

  record(
    input: CreateAuditLogInput
  ): AuditLogEntry {
    const actor =
      input.actor ??
      this.getCurrentActor();

    if (!actor) {
      throw new Error(
        'Audit kaydı için işlem yapan kullanıcı belirlenemedi.'
      );
    }

    const entry: AuditLogEntry = {
      id: this.idGenerator.generate(),
      timestamp:
        new Date().toISOString(),

      userId:
        actor.userId,

      userName:
        actor.userName,

      userRole:
        actor.userRole,

      action:
        input.action,

      entityType:
        input.entityType,

      entityId:
        input.entityId,

      description:
        input.description,

      oldValue:
        input.oldValue,

      newValue:
        input.newValue
    };

    const currentEntries =
      this.entriesState();

    const nextEntries = [
      entry,
      ...currentEntries
    ].slice(
      0,
      this.maxEntries
    );

    this.db.setAll(
      'auditLog',
      nextEntries
    );

    this.entriesState.set(
      nextEntries
    );

    return {
      ...entry
    };
  }

  getById(
    id: string
  ): AuditLogEntry | null {
    return (
      this.entriesState()
        .find(
          entry => entry.id === id
        )
      ?? null
    );
  }

  filter(
    predicate:
      (entry: AuditLogEntry) => boolean
  ): AuditLogEntry[] {
    return this
      .newestFirst()
      .filter(predicate);
  }

  reload(): void {
    this.entriesState.set(
      this.loadEntries()
    );
  }

  clearForDemoReset(): void {
    this.db.clearCollection(
      'auditLog'
    );

    this.entriesState.set([]);
  }

  private loadEntries():
    AuditLogEntry[] {
    return this.db
      .getAll<AuditLogEntry>(
        'auditLog'
      )
      .slice(
        0,
        this.maxEntries
      );
  }

  private getCurrentActor():
    AuditActor | null {
    const user =
      this.authService.currentUser();

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      userName: user.fullName,
      userRole: user.role
    };
  }
}
