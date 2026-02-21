const windows = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

export function checkRateLimit(req, {
  keyPrefix,
  limit,
  windowMs,
}) {
  const now = Date.now();
  const key = `${keyPrefix}:${getClientIp(req)}`;

  const timestamps = windows.get(key) || [];
  const cutoff = now - windowMs;
  const fresh = timestamps.filter((ts) => ts > cutoff);

  if (fresh.length >= limit) {
    const retryAfterSec = Math.ceil((fresh[0] + windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfterSec,
    };
  }

  fresh.push(now);
  windows.set(key, fresh);

  return {
    allowed: true,
    retryAfterSec: 0,
  };
}
