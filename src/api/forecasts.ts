import { request } from './client.ts'
import type { ForecastOccurrence, ForecastsResponse } from './types.ts'

export async function getForecasts(
  token: string,
  from: string,
  to: string,
): Promise<ForecastOccurrence[]> {
  const params = new URLSearchParams({ from, to })
  const response = await request<ForecastsResponse>(
    `/api/v1/forecasts?${params.toString()}`,
    { token },
  )
  return response.forecasts
}
