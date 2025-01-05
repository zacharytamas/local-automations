module.exports = {
  apps: [
    {
      name: "daily-stoic",
      cwd: "/Users/zachary/Development/automations",
      script: "bun ./src/daily-stoic/daily-stoic.ts",
      cron_restart: "0 6 * * *",
      autorestart: false,
    },
    {
      name: "daily-dad",
      cwd: "/Users/zachary/Development/automations",
      script: "bun ./src/daily-dad/daily-dad.ts",
      cron_restart: "0 6 * * *",
      autorestart: false,
    },
  ],
};
