import AxiosClient from "../api/AxiosClient";
import { isMockEnabled, getMockData } from "../config/MockConfig";

const leaveService = new AxiosClient("/leaves");

export const getAllLeaves = async () => {
  if (isMockEnabled()) {
    const mockData = await getMockData("/leaves");
    return mockData ?? [];
  }
  const response = await leaveService.get();
  return response ?? [];
};
