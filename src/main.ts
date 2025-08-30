// Minimal browser entry for Vite demo with API call via proxy.
const out = document.getElementById("output");
const btnHealth = document.getElementById("btnHealth");
const btnHello = document.getElementById("btnHello");
const nameInput = document.getElementById("nameInput") as HTMLInputElement | null;

function setOut(text: string) {
  if (out) out.textContent = text;
}

async function callHealth() {
  try {
    const res = await fetch("/api/health");
    const json = (await res.json()) as HealthResponse;
    console.log("/api/health:", json);
    setOut(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Failed to fetch /api/health", err);
    setOut("Failed to fetch /api/health");
  }
}

async function callHello() {
  try {
    const name = (nameInput?.value || "").trim();
    const q = name ? `?name=${encodeURIComponent(name)}` : "";
    const res = await fetch(`/api/hello${q}`);
    const json = (await res.json()) as HelloResponse;
    console.log("/api/hello:", json);
    setOut(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Failed to fetch /api/hello", err);
    setOut("Failed to fetch /api/hello");
  }
}

btnHealth?.addEventListener("click", callHealth);
btnHello?.addEventListener("click", callHello);

// Initial ping with simple retry to avoid race with server startup
function initialHealthCheck(retries = 3, delayMs = 500) {
  const attempt = async (left: number) => {
    try {
      await callHealth();
    } catch {
      // callHealth already logs and updates output; on final attempt keep the error
    } finally {
      // If output still shows the initial text, retry
      const current = (out?.textContent || "").trim();
      if (current === "Ready." && left > 0) {
        setTimeout(() => void attempt(left - 1), delayMs);
      }
    }
  };
  setTimeout(() => void attempt(retries), delayMs);
}

// Ensure DOM is ready before we kick off the initial check
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => initialHealthCheck());
} else {
  initialHealthCheck();
}
import type { HealthResponse, HelloResponse } from "@/shared/types";
