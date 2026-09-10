import "server-only";
export const liveMode = () => process.env.HUB_MODE === "live";
export function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`missing_configuration:${name}`);
  return value;
}
export function appOrigin() {
  const url = new URL(required("APP_URL"));
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("invalid_app_origin");
  if (
    url.protocol !== "https:" &&
    !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")
  )
    throw new Error("https_required");
  return url.origin;
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === appOrigin();
}
export function isConfigured() {
  return [
    "DATABASE_URL",
    "APP_URL",
    "HUB_ADMIN_EMAIL",
    "HUB_ADMIN_PASSWORD_HASH",
    "TOKEN_ENCRYPTION_KEY",
    "CLIENT_ID",
    "CLIENT_SECRET",
  ].every((key) => Boolean(process.env[key]));
}
