import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  provideRouter
} from '@angular/router';

import {
  routes
} from './app.routes';

import {
  errorHandlingInterceptor
} from './core/interceptors/error-handling.interceptor';

import {
  loadingInterceptor
} from './core/interceptors/loading.interceptor';

import {
  mockApiInterceptor
} from './core/interceptors/mock-api.interceptor';

import {
  MockDbSeedService
} from './core/mock-api/mock-db-seed';


export const appConfig:
  ApplicationConfig = {

    providers: [

      provideBrowserGlobalErrorListeners(),

      provideRouter(
        routes
      ),

      provideHttpClient(
        withInterceptors([
          loadingInterceptor,
          errorHandlingInterceptor,
          mockApiInterceptor
        ])
      ),

      provideAppInitializer(
        () => {
          const seedService =
            inject(
              MockDbSeedService
            );

          seedService.seedIfNeeded();
        }
      )
    ]
  };
