const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable symlinks for better monorepo support
config.resolver.symlinks = true;
config.resolver.unstable_enableSymlinks = true;

// Watchman timeout increase for large projects
config.watchOptions = {
  pollIntervalMs: 1000,
  watchman: {
    timeout: 30000,
  },
};

// Improve Metro performance with large node_modules
config.maxWorkers = 4;

module.exports = config;
