import type { IncomingMessage, ServerResponse } from "node:http";

// Minimal endpoint template.
// Usage:
// 1) Apply template: `just template endpoint . NAME=hello`
// 2) Wire into src/index.ts request handler, for example:
//    import { handle__NAME__ } from "@/api/__NAME__";
//    if (pathname === "/__NAME__") return handle__NAME__(req, res);

export function handle__NAME__(req: IncomingMessage, res: ServerResponse) {
  const body = JSON.stringify({ message: "__NAME__ ok" });
  res.writeHead(200, { "content-type": "application/json" });
  res.end(body);
}
