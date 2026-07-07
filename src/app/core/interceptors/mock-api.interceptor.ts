import { UserRole } from '../models/user-role.enum';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  delay,
  of,
  throwError
} from 'rxjs';

import {
  ProductsMockHandler
} from '../mock-api/handlers/products.mock-handler';

import {
  WarehousesMockHandler
} from '../mock-api/handlers/warehouses.mock-handler';

import {
  StockMovementsMockHandler
} from '../mock-api/handlers/stock-movements.mock-handler';

import {
  TransfersMockHandler
} from '../mock-api/handlers/transfers.mock-handler';

import {
  ShipmentsMockHandler
} from '../mock-api/handlers/shipments.mock-handler';

import {
  LowStockRulesMockHandler
} from '../mock-api/handlers/low-stock-rules.mock-handler';

import {
  CriticalStockMockHandler
} from '../mock-api/handlers/critical-stock.mock-handler';

import {
  CriticalStockQueryService
} from '../../features/critical-stock/services/critical-stock-query';

import {
  StockBalanceQueryService
} from '../../features/stock-movements/services/stock-balance-query';

import {
  AuditLogService
} from '../services/audit-log';

import {
  AuthService
} from '../services/auth';

import {
  IdGeneratorService
} from '../services/id-generator';

import {
  MockApiRuntimeService
} from '../services/mock-api-runtime';

import {
  MockDbService
} from '../services/mock-db';


interface ParsedMockRoute {
  resource: string;
  entityId: string | null;
  action: string | null;
}


export const mockApiInterceptor:
  HttpInterceptorFn = (
    request,
    next
  ) => {

    if (
      !request.url.startsWith(
        '/api/'
      )
    ) {
      return next(
        request
      );
    }


    const db =
      inject(
        MockDbService
      );


    const runtime =
      inject(
        MockApiRuntimeService
      );


    const auditLog =
      inject(
        AuditLogService
      );


    const idGenerator =
      inject(
        IdGeneratorService
      );


    const balanceQuery =
      inject(
        StockBalanceQueryService
      );


    const authService =
      inject(
        AuthService
      );
    assertRbacPermission(
      request,
      authService
    );


    const criticalStockQuery =
      inject(
        CriticalStockQueryService
      );


    const latency =
      runtime.randomLatency();


    if (
      runtime.shouldFail()
    ) {

      return throwError(
        () =>
          new HttpErrorResponse({
            status: 503,

            statusText:
              'Service Unavailable',

            error:
              runtime.error(
                'SimÃƒÆ’Ã‚Â¼le edilmiÃƒ…Ã…Â¸ servis hatasÃƒâ€Ã‚Â±.',
                'SIMULATED_FAILURE'
              )
          })
      ).pipe(
        delay(
          latency
        )
      );
    }


    try {

      const route =
        parseRoute(
          request
        );


      const response =
        dispatchRequest(
          request,
          route,
          db,
          runtime,
          auditLog,
          idGenerator,
          balanceQuery,
          authService,
          criticalStockQuery
        );


      return of(
        response
      ).pipe(
        delay(
          latency
        )
      );

    } catch (error) {

      if (
        error instanceof
          HttpErrorResponse
      ) {

        return throwError(
          () => error
        ).pipe(
          delay(
            latency
          )
        );
      }


      return throwError(
        () =>
          new HttpErrorResponse({
            status: 500,

            statusText:
              'Internal Server Error',

            error:
              runtime.error(
                error instanceof Error
                  ? error.message
                  : 'Beklenmeyen mock API hatasÃƒâ€Ã‚Â±.',
                'MOCK_API_ERROR'
              )
          })
      ).pipe(
        delay(
          latency
        )
      );
    }
  };


function assertRbacPermission(
  request: HttpRequest<unknown>,
  authService: AuthService
): void {
  const method =
    request.method.toUpperCase();

  if (
    method === 'GET'
    ||
    method === 'HEAD'
    ||
    method === 'OPTIONS'
  ) {
    return;
  }

  const user =
    authService.currentUser();

  if (!user) {
    throw new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: {
        success: false,
        message: 'Oturum bulunamadı.',
        code: 'AUTH_REQUIRED',
        timestamp:
          new Date().toISOString()
      }
    });
  }

  if (
    user.role ===
    UserRole.OPERASYON_YONETICISI
  ) {
    return;
  }

  if (
    user.role ===
    UserRole.GORUNTULEYICI
  ) {
    throw forbiddenRbacError();
  }

  if (
    user.role ===
    UserRole.DEPO_SORUMLUSU
  ) {
    const cleanUrl =
      request.url.split('?')[0];

    const masterDataAllowed =
      (
        method === 'POST'
        &&
        (
          cleanUrl === '/api/products'
          ||
          cleanUrl === '/api/warehouses'
        )
      )
      ||
      (
        (
          method === 'PATCH'
          ||
          method === 'DELETE'
        )
        &&
        (
          /^\/api\/products\/[^/]+$/
            .test(cleanUrl)
          ||
          /^\/api\/warehouses\/[^/]+$/
            .test(cleanUrl)
        )
      );

    const operationCreateAllowed =
      method === 'POST'
      &&
      (
        cleanUrl ===
          '/api/stock-movements'
        ||
        cleanUrl ===
          '/api/transfers'
        ||
        cleanUrl ===
          '/api/shipments'
      );

    if (
      masterDataAllowed
      ||
      operationCreateAllowed
    ) {
      return;
    }
  }

  throw forbiddenRbacError();
}

function forbiddenRbacError():
  HttpErrorResponse {

  return new HttpErrorResponse({
    status: 403,
    statusText: 'Forbidden',
    error: {
      success: false,
      message:
        'Bu iÃƒ…Ã…Â¸lem iÃƒÆ’Ã‚Â§in rol yetkiniz yok.',
      code:
        'RBAC_FORBIDDEN',
      timestamp:
        new Date().toISOString()
    }
  });
}

function parseRoute(
  request:
    HttpRequest<unknown>
): ParsedMockRoute {

  const cleanUrl =
    request.url
      .split('?')[0]
      .replace(
        /^\/api\//,
        ''
      );


  const segments =
    cleanUrl
      .split('/')
      .filter(Boolean);


  return {
    resource:
      segments[0] ?? '',

    entityId:
      segments[1] ?? null,

    action:
      segments[2] ?? null
  };
}


function dispatchRequest(
  request:
    HttpRequest<unknown>,

  route:
    ParsedMockRoute,

  db:
    MockDbService,

  runtime:
    MockApiRuntimeService,

  auditLog:
    AuditLogService,

  idGenerator:
    IdGeneratorService,

  balanceQuery:
    StockBalanceQueryService,

  authService:
    AuthService,

  criticalStockQuery:
    CriticalStockQueryService

): HttpResponse<unknown> {

  switch (
    route.resource
  ) {

    case 'products':

      return new ProductsMockHandler(
        db,
        runtime,
        auditLog,
        idGenerator
      ).handle(
        request,
        route.entityId
      );


    case 'warehouses':

      return new WarehousesMockHandler(
        db,
        runtime,
        auditLog
      ).handle(
        request,
        route.entityId
      );


    case 'stock-movements':

      return new StockMovementsMockHandler(
        db,
        runtime,
        auditLog,
        idGenerator,
        balanceQuery
      ).handle(
        request,
        route.entityId,
        route.action
      );


    case 'transfers':

      return new TransfersMockHandler(
        db,
        runtime,
        auditLog,
        idGenerator,
        balanceQuery,
        authService
      ).handle(
        request,
        route.entityId,
        route.action
      );


    case 'shipments':

      return new ShipmentsMockHandler(
        db,
        runtime,
        auditLog,
        idGenerator,
        balanceQuery,
        authService
      ).handle(
        request,
        route.entityId,
        route.action
      );


    case 'low-stock-rules':

      return new LowStockRulesMockHandler(
        db,
        runtime,
        auditLog,
        idGenerator
      ).handle(
        request,
        route.entityId
      );


    case 'critical-stock':

      return new CriticalStockMockHandler(
        db,
        runtime,
        criticalStockQuery
      ).handle(
        request
      );


    default:

      throw new HttpErrorResponse({
        status: 404,

        statusText:
          'Not Found',

        error:
          runtime.error(
            `Mock API endpoint bulunamadÃƒâ€Ã‚Â±: ${route.resource}`,
            'ENDPOINT_NOT_FOUND'
          )
      });
  }
}
