import {
  Injectable,
  signal
} from '@angular/core';

import {
  DEFAULT_MOCK_API_CONFIG,
  MockApiConfig
} from '../models/mock-api-config';

@Injectable({
  providedIn: 'root'
})
export class MockApiConfigService {

  private readonly configState =
    signal<MockApiConfig>({
      ...DEFAULT_MOCK_API_CONFIG
    });

  readonly config =
    this.configState.asReadonly();

  setLatency(
    minLatencyMs: number,
    maxLatencyMs: number
  ): void {
    const safeMin =
      Math.max(
        0,
        Math.floor(minLatencyMs)
      );

    const safeMax =
      Math.max(
        safeMin,
        Math.floor(maxLatencyMs)
      );

    this.configState.update(
      current => ({
        ...current,
        minLatencyMs: safeMin,
        maxLatencyMs: safeMax
      })
    );
  }

  setFailureRate(
    failureRate: number
  ): void {
    const safeRate =
      Math.min(
        1,
        Math.max(
          0,
          failureRate
        )
      );

    this.configState.update(
      current => ({
        ...current,
        failureRate: safeRate
      })
    );
  }

  reset(): void {
    this.configState.set({
      ...DEFAULT_MOCK_API_CONFIG
    });
  }
}
