import AxiosClient from "../api/AxiosClient";
import { isMockEnabled, getMockData } from "../config/MockConfig";

const employeeService = new AxiosClient("/employees");

export const getAllEmployees = async () => {
  if (isMockEnabled()) {
    const mockData = await getMockData("/employees");
    return mockData ?? [];
  }
  const response = await employeeService.get();
  return response ?? [];
};

export const getEmployee = async (id) => {
  if (isMockEnabled()) {
    const mockData = await getMockData(`/employees/${id}`);
    return mockData ?? {};
  }
  const response = await employeeService.get(`/${id}`);
  return response ?? {};
};