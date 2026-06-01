let mockEnabled = false;
let mockLoader = null;

export const enableMockMode = (loader) => {
  mockEnabled = true;
  mockLoader = loader;
  console.log("🎭 Mock mode enabled");
};

export const disableMockMode = () => {
  mockEnabled = false;
  mockLoader = null;
  console.log("🌐 Mock mode disabled");
};

export const isMockEnabled = () => {
  return mockEnabled;
};

export const getMockData = async (endpoint) => {
  if (!mockLoader) {
    throw new Error("Mock loader not configured");
  }
  return await mockLoader(endpoint);
};
