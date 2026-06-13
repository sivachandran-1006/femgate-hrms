let platformConfig = null;

export const configurePlatform = (config) => {
  platformConfig = config;
};

export const getPlatformConfig = () => {
  if (!platformConfig) {
    throw new Error("Platform not configured. Call configurePlatform() first.");
  }
  return platformConfig;
};

export const isConfigured = () => {
  return platformConfig !== null;
};
