import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  AuditActionType
} from '../../../../core/models/audit-action-type.enum';

import {
  AuditLogService
} from '../../../../core/services/audit-log';

import {
  AuditLogQueryService
} from '../../services/audit-log-query';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss'
})
export class AuditLog {
  readonly audit =
    inject(AuditLogService);

  readonly queryService =
    inject(AuditLogQueryService);

  readonly search =
    signal('');

  readonly selectedAction =
    signal('Tümü');

  readonly actions =
    Object.values(
      AuditActionType
    );

  readonly entries =
    this.audit.newestFirst;

  readonly userCount =
    computed(
      () =>
        new Set(
          this.entries()
            .map(
              entry =>
                entry.userId
            )
        ).size
    );

  readonly entityTypeCount =
    computed(
      () =>
        new Set(
          this.entries()
            .map(
              entry =>
                entry.entityType
            )
        ).size
    );

  readonly filtered =
    computed(
      () =>
        this.queryService.query(
          this.entries(),
          {
            page: 1,

            pageSize: 500,

            search:
              this.search().trim()
              || undefined,

            action:
              this.resolveAction()
          }
        ).items
    );

  load(): void {
    this.audit.reload();
  }

  onSearch(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLInputElement
    ) {
      this.search.set(
        target.value
      );
    }
  }

  onAction(
    event: Event
  ): void {
    const target =
      event.target;

    if (
      target instanceof
      HTMLSelectElement
    ) {
      this.selectedAction.set(
        target.value
      );
    }
  }

  private resolveAction():
    AuditActionType | undefined {
    const selected =
      this.selectedAction();

    if (
      selected === 'Tümü'
    ) {
      return undefined;
    }

    return Object
      .values(
        AuditActionType
      )
      .find(
        action =>
          action === selected
      );
  }
}
