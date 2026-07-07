export interface MockApiConfig {
  minLatencyMs: number;
  maxLatencyMs: number;
  failureRate: number;
}

export const DEFAULT_MOCK_API_CONFIG:
  Readonly<MockApiConfig> = {
    minLatencyMs: 250,
    maxLatencyMs: 700,
    failureRate: 0
  };
