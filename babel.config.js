module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Removed conflicting proposals - Expo 54+ handles these internally
      // Only keep necessary plugins for decorator support if needed
    ],
  };
};
