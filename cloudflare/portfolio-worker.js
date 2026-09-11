const UPSTREAM_ORIGIN = "https://timyeou1234.github.io";
const UPSTREAM_BASE_PATH = "/resume";
const CANONICAL_HOST = "timyeou.com";

function redirectToCanonical(url) {
  const canonical = new URL(url);
  canonical.protocol = "https:";
  canonical.hostname = CANONICAL_HOST;
  canonical.port = "";
  return Response.redirect(canonical.toString(), 308);
}

function upstreamUrlFor(url) {
  const upstream = new URL(UPSTREAM_ORIGIN);
  upstream.pathname = `${UPSTREAM_BASE_PATH}${url.pathname}`;
  upstream.search = url.search;
  return upstream;
}

function rewriteUpstreamLocation(location) {
  if (!location) return null;

  const resolved = new URL(location, UPSTREAM_ORIGIN);
  if (resolved.origin !== UPSTREAM_ORIGIN || !resolved.pathname.startsWith(UPSTREAM_BASE_PATH)) {
    return location;
  }

  const publicUrl = new URL(`https://${CANONICAL_HOST}`);
  publicUrl.pathname = resolved.pathname.slice(UPSTREAM_BASE_PATH.length) || "/";
  publicUrl.search = resolved.search;
  publicUrl.hash = resolved.hash;
  return publicUrl.toString();
}

function forwardedHeaders(request) {
  const headers = new Headers();
  [
    "accept",
    "accept-encoding",
    "accept-language",
    "if-modified-since",
    "if-none-match",
    "if-range",
    "range"
  ].forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });
  return headers;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === `www.${CANONICAL_HOST}`) {
      return redirectToCanonical(url);
    }

    if (url.pathname === UPSTREAM_BASE_PATH || url.pathname.startsWith(`${UPSTREAM_BASE_PATH}/`)) {
      const canonical = new URL(url);
      canonical.pathname = url.pathname.slice(UPSTREAM_BASE_PATH.length) || "/";
      return redirectToCanonical(canonical);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" }
      });
    }

    const upstreamResponse = await fetch(upstreamUrlFor(url), {
      method: request.method,
      headers: forwardedHeaders(request),
      redirect: "manual"
    });
    const headers = new Headers(upstreamResponse.headers);
    const rewrittenLocation = rewriteUpstreamLocation(headers.get("location"));

    if (rewrittenLocation) headers.set("location", rewrittenLocation);
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("x-content-type-options", "nosniff");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers
    });
  }
};
