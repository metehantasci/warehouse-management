import {
  Injectable,
  inject
} from '@angular/core';

import {
  MockApiErrorBody,
  MockApiSuccessBody
} from '../models/mock-api-response.types';

import {
  MockApiConfigService
} from './mock-api-config';

@Injectable({
  providedIn: 'root'
})
export class MockApiRuntimeService {

  private readonly configService =
    inject(MockApiConfigService);

  randomLatency(): number {
    const config =
      this.configService.config();

    const min =
      Math.max(
        0,
        config.minLatencyMs
      );

    const max =
      Math.max(
        min,
        config.maxLatencyMs
      );

    return Math.floor(
      Math.random() *
      (max - min + 1)
    ) + min;
  }

  shouldFail(): boolean {
    const failureRate =
      this.configService
        .config()
        .failureRate;

    return Math.random() <
      failureRate;
  }

  success<T>(
    data: T,
    message?: string
  ): MockApiSuccessBody<T> {
    return {
      success: true,
      data,
      message,
      timestamp:
        new Date().toISOString()
    };
  }

  error(
    message: string,
    code: string,
    details?: unknown
  ): MockApiErrorBody {
    return {
      success: false,
      message,
      code,
      timestamp:
        new Date().toISOString(),
      details
    };
  }
}
