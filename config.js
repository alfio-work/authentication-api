module.exports = (function () {
  const env = process.env;
  return {
    PORT: env.PORT,
    DB: {
      default: {
        host: env.DB_DEFAULT_HOST,
        user: env.DB_DEFAULT_USER,
        password: env.DB_DEFAULT_PASSWORD,
        database: env.DB_DEFAULT_DATABASE,
        client: env.DB_DEFAULT_CLIENT
      }
    },
    JWT_ISSUER: env.JWT_ISSUER
  }
})();