module.exports = {
  apps: [
    {
      name: "voluntariado-backend",
      script: "index.js",
      cwd: "/home/ec2-user/voluntariado/backend",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",

      env: {
        NODE_ENV: "development",
        IS_PROD: "false",
      },

      env_production: {
        NODE_ENV: "production",
        IS_PROD: "true",
      },
    },
  ],
};
