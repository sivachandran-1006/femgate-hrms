import { mockRegistry } from "./mockRegistry.generated";

const simulateDelay = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const matchesPattern = (pattern, endpoint) => {
  const patternParts = pattern.split("/");
  const endpointParts = endpoint.split("/");

  if (patternParts.length !== endpointParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    return part.startsWith(":") || part === endpointParts[index];
  });
};

const extractParams = (pattern, endpoint) => {
  const patternParts = pattern.split("/");
  const endpointParts = endpoint.split("/");
  const params = {};

  patternParts.forEach((part, index) => {
    if (part.startsWith(":")) {
      const paramName = part.slice(1);
      params[paramName] = endpointParts[index];
    }
  });

  return params;
};

export const loadMockData = async (endpoint, delay = 500) => {
  console.log(`🎭 Loading mock data for: ${endpoint}`);

  await simulateDelay(delay);

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  if (mockRegistry[normalizedEndpoint]) {
    console.log(`✅ Mock data found (exact): ${normalizedEndpoint}`);
    return mockRegistry[normalizedEndpoint];
  }

  const matchedPattern = Object.keys(mockRegistry).find(
    (pattern) =>
      pattern.includes(":") && matchesPattern(pattern, normalizedEndpoint)
  );

  if (matchedPattern) {
    console.log(
      `✅ Mock data found (pattern): ${matchedPattern} → ${normalizedEndpoint}`
    );
    return mockRegistry[matchedPattern];
  }

  console.error(`❌ No mock data found for: ${normalizedEndpoint}`);
  throw new Error(
    `No mock data available for endpoint: ${endpoint}\n` +
      `Please add it to mockRegistry`
  );
};

export const hasMockData = (endpoint) => {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  if (mockRegistry[normalizedEndpoint]) {
    return true;
  }

  return Object.keys(mockRegistry).some(
    (pattern) =>
      pattern.includes(":") && matchesPattern(pattern, normalizedEndpoint)
  );
};
