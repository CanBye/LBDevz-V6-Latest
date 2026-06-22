import crypto from "node:crypto"

/**
 * Ed25519 anti-MITM signing for the license validate endpoint.
 *
 * The plugin loader (LoaderPlugin.java) verifies an Ed25519 signature over
 * `licenseKey + ":" + hex(keyHalf) + ":" + nonce` using a public key baked into
 * the protected JAR. This stops a man-in-the-middle from forging/replaying a
 * `keyHalf` response: only the holder of LICENSE_ED25519_PRIVATE_KEY can sign,
 * and the nonce binds the signature to a single fresh request.
 *
 * Key format: PKCS#8 (private) / SPKI X.509 (public), base64-encoded (no PEM
 * header), matching what `crypto.generateKeyPairSync("ed25519", ...).export`
 * produces with `format: "der"`. The loader decodes the public key with
 * X509EncodedKeySpec, so SPKI/DER is the correct interop format.
 *
 * Generate a keypair:
 *   node -e "const c=require('crypto');const{publicKey,privateKey}=c.generateKeyPairSync('ed25519');console.log('PRIV='+privateKey.export({type:'pkcs8',format:'der'}).toString('base64'));console.log('PUB='+publicKey.export({type:'spki',format:'der'}).toString('base64'))"
 */

/** Builds the canonical payload string that both server and loader sign/verify. */
export function buildSignaturePayload(
  licenseKey: string,
  keyHalfB64: string,
  nonce: string
): string {
  // keyHalf is signed as lowercase hex of the raw bytes (matches loader's toHex()).
  const keyHalfHex = Buffer.from(keyHalfB64, "base64").toString("hex")
  return `${licenseKey}:${keyHalfHex}:${nonce}`
}

/**
 * Signs the payload with the configured Ed25519 private key.
 * Returns a base64 signature, or null when no signing key is configured
 * (keeps the endpoint backward-compatible: no key => no signature field).
 */
export function signLicensePayload(payload: string): string | null {
  const privB64 = process.env.LICENSE_ED25519_PRIVATE_KEY
  if (!privB64 || privB64.trim() === "") return null

  try {
    const keyObject = crypto.createPrivateKey({
      key: Buffer.from(privB64, "base64"),
      format: "der",
      type: "pkcs8",
    })
    // Ed25519: pass null algorithm; crypto.sign handles the digest internally.
    const signature = crypto.sign(null, Buffer.from(payload, "utf8"), keyObject)
    return signature.toString("base64")
  } catch (err) {
    // Never throw out of validation just because signing is misconfigured.
    console.error("[license-signing] sign failed:", err)
    return null
  }
}

/** True when an Ed25519 signing key is configured (anti-MITM active). */
export function isSigningEnabled(): boolean {
  return Boolean(process.env.LICENSE_ED25519_PRIVATE_KEY?.trim())
}
