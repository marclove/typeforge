import { type IncomingMessage, type ServerResponse, createServer } from "node:http";
import { env } from "@/env";
import type { HealthResponse, HelloResponse } from "@/shared/types";

const name = "typeforge";
const port = env.SERVER_PORT;

function requestHandler(req: IncomingMessage, res: ServerResponse) {
  const method = req.method || "GET";
  const rawUrl = req.url || "/";
  const origin = `http://${req.headers.host || `localhost:${port}`}`;
  const u = new URL(rawUrl, origin);
  const pathname = u.pathname;

  if (pathname === "/health") {
    const payload: HealthResponse = {
      status: "ok",
      service: name,
      time: new Date().toISOString(),
    };
    const body = JSON.stringify(payload);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(body);
    return;
  }

  if (pathname === "/hello") {
    const who = u.searchParams.get("name") || "world";
    const payload: HelloResponse = { message: `hello ${who}` };
    const body = JSON.stringify(payload);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(body);
    return;
  }

  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end(`${name} server running on port ${port}\n${method} ${pathname}`);
}

const server = createServer(requestHandler);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`${name}: server listening on http://localhost:${port}`);
});

function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${name}: received ${signal}, shutting down...`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log(`${name}: server closed`);
    process.exit(0);
  });
  // Force exit after timeout
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
