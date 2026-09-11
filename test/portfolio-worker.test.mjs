import assert from "node:assert/strict";
import test from "node:test";

import worker from "../cloudflare/portfolio-worker.js";

test("proxies root and assets to the GitHub Pages project path", async (t) => {
  const originalFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push({ url: String(url), init });
    return new Response("ok", { headers: { "content-type": "text/plain" } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const root = await worker.fetch(new Request("https://timyeou.com/?lang=zh"));
  const asset = await worker.fetch(
    new Request("https://timyeou.com/assets/ai.pdf", { headers: { range: "bytes=0-99" } })
  );

  assert.equal(root.status, 200);
  assert.equal(asset.status, 200);
  assert.equal(seen[0].url, "https://timyeou1234.github.io/resume/?lang=zh");
  assert.equal(seen[1].url, "https://timyeou1234.github.io/resume/assets/ai.pdf");
  assert.equal(seen[1].init.headers.get("range"), "bytes=0-99");
});

test("redirects www and legacy project paths to the canonical domain", async () => {
  const www = await worker.fetch(new Request("https://www.timyeou.com/assets/ai.pdf?download=1"));
  const legacy = await worker.fetch(new Request("https://timyeou.com/resume/resume.html"));

  assert.equal(www.status, 308);
  assert.equal(www.headers.get("location"), "https://timyeou.com/assets/ai.pdf?download=1");
  assert.equal(legacy.status, 308);
  assert.equal(legacy.headers.get("location"), "https://timyeou.com/resume.html");
});

test("rejects mutating HTTP methods", async () => {
  const response = await worker.fetch(
    new Request("https://timyeou.com/", { method: "POST", body: "ignored" })
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

test("rewrites same-site upstream redirects", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(null, {
      status: 301,
      headers: { location: "https://timyeou1234.github.io/resume/resume.html" }
    });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const response = await worker.fetch(new Request("https://timyeou.com/cv"));
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://timyeou.com/resume.html");
});
