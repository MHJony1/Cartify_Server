export interface IDateRangeQuery {
  from?: string;
  to?: string;
  period?: "7d" | "30d" | "90d" | "1y" | "custom";
}

export interface IAnalyticsQuery extends IDateRangeQuery {
  limit?: number | string;
  page?: number | string;
}
