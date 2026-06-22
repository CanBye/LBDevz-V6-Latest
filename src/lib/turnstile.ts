export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const isProd = process.env.NODE_ENV === "production"

  // Fail-closed in production when the secret is missing/misconfigured.
  // In non-production, verification is only skipped when explicitly opted in
  // via TURNSTILE_DISABLE_IN_DEV=1 (never silently in production).
  if (!secret) {
    if (isProd) return false
    return process.env.TURNSTILE_DISABLE_IN_DEV === "1"
  }

  if (!token) return false

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}
