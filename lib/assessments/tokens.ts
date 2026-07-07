import crypto from "crypto";

function getTokenSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET não configurado.");
  }

  return secret;
}

function base64url(buffer: Buffer) {
  return buffer.toString("base64url");
}

function signTokenParts(assessmentId: string, nonce: string) {
  return crypto
    .createHmac("sha256", getTokenSecret())
    .update(`${assessmentId}.${nonce}`)
    .digest("base64url");
}

export function buildAssessmentToken(assessmentId: string, nonce: string) {
  const signature = signTokenParts(assessmentId, nonce);

  return `${assessmentId}.${nonce}.${signature}`;
}

export function createAssessmentToken(assessmentId: string) {
  const nonce = base64url(crypto.randomBytes(32));
  const token = buildAssessmentToken(assessmentId, nonce);

  return {
    nonce,
    token,
    tokenHash: hashAssessmentToken(token),
  };
}

export function hashAssessmentToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isWellFormedAssessmentToken(token: string) {
  const [assessmentId, nonce, signature] = token.split(".");

  if (!assessmentId || !nonce || !signature) {
    return false;
  }

  const expectedSignature = signTokenParts(assessmentId, nonce);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

export function getAssessmentPublicUrl(token: string) {
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "";
  const path = `/assessment/${token}`;

  if (!appUrl) {
    return path;
  }

  return `${appUrl.replace(/\/$/, "")}${path}`;
}
