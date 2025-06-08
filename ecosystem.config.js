module.exports = {
  apps: [
    {
      name: "auth",
      script: "dist/apps/auth/main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "campaign",
      script: "dist/apps/campaign/main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3002,
      },
    },
    {
      name: "notifications",
      script: "dist/apps/notifications/main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3003,
      },
    },
  ],
};
