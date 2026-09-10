// A conexão sensível do Marketplace está disponível no build de produção.
// Nunca migrar o banco real em previews ou em builds demonstrativos.
if (process.env.VERCEL_ENV === "production" && process.env.HUB_MODE === "live")
  await import("./migrate.mjs");
