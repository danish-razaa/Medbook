module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
