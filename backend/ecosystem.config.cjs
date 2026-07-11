module.exports = {
  apps: [
    {
      name: "socorro-backend",
      script: "index.js",
      cwd: "/home/ec2-user/voluntariado/backend",

      // modo fork o cluster
      exec_mode: "fork",
      instances: 1,

      // reinicio automático
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",

      // variables desarrollo
      env: {
        NODE_ENV: "development",
      },

      // variables producción
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
