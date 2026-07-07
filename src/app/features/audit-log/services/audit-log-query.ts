import {
  Injectable
} from '@angular/core';

import {
  AuditActionType
} from '../../../core/models/audit-action-type.enum';

import {
  PaginatedResult
} from '../../../core/models/paginated-result';

import {
  AuditLogEntry
} from '../models/audit-log-entry';


export interface AuditLogQueryParams {
  page: number;

  pageSize: number;

  search?: string;

  action?:
    AuditActionType;

  entityType?:
    string;

  userId?:
    string;

  dateFrom?:
    string;

  dateTo?:
    string;
}


@Injectable({
  providedIn:
    'root'
})
export class AuditLogQueryService {

  query(
    entries:
      readonly AuditLogEntry[],

    params:
      AuditLogQueryParams
  ): PaginatedResult<AuditLogEntry> {

    let filtered =
      entries.slice();


    const search =
      params.search
        ?.trim()
        .toLocaleLowerCase(
          'tr-TR'
        );


    if (search) {

      filtered =
        filtered.filter(
          entry =>
            entry.description
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
            ||
            entry.entityType
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
            ||
            entry.entityId
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
            ||
            entry.userName
              .toLocaleLowerCase(
                'tr-TR'
              )
              .includes(search)
        );
    }


    if (params.action) {

      filtered =
        filtered.filter(
          entry =>
            entry.action ===
              params.action
        );
    }


    if (
      params.entityType
        ?.trim()
    ) {

      filtered =
        filtered.filter(
          entry =>
            entry.entityType ===
              params.entityType
        );
    }


    if (
      params.userId
        ?.trim()
    ) {

      filtered =
        filtered.filter(
          entry =>
            entry.userId ===
              params.userId
        );
    }


    if (params.dateFrom) {

      const fromTime =
        new Date(
          params.dateFrom
        ).getTime();


      if (
        Number.isFinite(
          fromTime
        )
      ) {

        filtered =
          filtered.filter(
            entry =>
              new Date(
                entry.timestamp
              ).getTime()
              >= fromTime
          );
      }
    }


    if (params.dateTo) {

      const toTime =
        new Date(
          params.dateTo
        ).getTime();


      if (
        Number.isFinite(
          toTime
        )
      ) {

        filtered =
          filtered.filter(
            entry =>
              new Date(
                entry.timestamp
              ).getTime()
              <= toTime
          );
      }
    }


    filtered =
      filtered
        .slice()
        .sort(
          (
            left,
            right
          ) =>
            new Date(
              right.timestamp
            ).getTime()
            -
            new Date(
              left.timestamp
            ).getTime()
        );


    const page =
      Math.max(
        1,
        Number(
          params.page
        )
        || 1
      );


    const pageSize =
      Math.max(
        1,
        Number(
          params.pageSize
        )
        || 10
      );


    const totalItems =
      filtered.length;


    const totalPages =
      totalItems === 0
        ? 0
        : Math.ceil(
            totalItems /
            pageSize
          );


    const startIndex =
      (
        page - 1
      )
      * pageSize;


    return {
      items:
        filtered.slice(
          startIndex,
          startIndex +
          pageSize
        ),

      page,

      pageSize,

      totalItems,

      totalPages,

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages
    };
  }


  getEntityTypes(
    entries:
      readonly AuditLogEntry[]
  ): string[] {

    return [
      ...new Set(
        entries.map(
          entry =>
            entry.entityType
        )
      )
    ]
      .sort(
        (
          left,
          right
        ) =>
          left.localeCompare(
            right,
            'tr-TR'
          )
      );
  }


  getUsers(
    entries:
      readonly AuditLogEntry[]
  ): {
    userId: string;
    userName: string;
  }[] {

    const users =
      new Map<
        string,
        string
      >();


    for (
      const entry
      of entries
    ) {

      users.set(
        entry.userId,
        entry.userName
      );
    }


    return [
      ...users.entries()
    ]
      .map(
        (
          [
            userId,
            userName
          ]
        ) => ({
          userId,
          userName
        })
      )
      .sort(
        (
          left,
          right
        ) =>
          left.userName
            .localeCompare(
              right.userName,
              'tr-TR'
            )
      );
  }
}



