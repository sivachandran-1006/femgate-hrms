import { useQuery } from "@tanstack/react-query";
import { getAllEmployees, getEmployee } from "../services/employeeService";

export const useFetchAllEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployees(),
  });
};

export const useFetchEmployee = (id) => {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
  });
};
