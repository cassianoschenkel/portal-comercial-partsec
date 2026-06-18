module.exports = {
  apps: [
    {
      name: "partsec-portal-comercial",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "1G",
      time: true,
    },
  ],
};
