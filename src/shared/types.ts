export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  service: string;
  time: string; // ISO string
}

export interface HelloResponse {
  message: string;
}
