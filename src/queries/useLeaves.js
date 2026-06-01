import { useQuery } from "@tanstack/react-query";
import { getAllLeaves } from "../services/leaveService";

export const useFetchAllLeaves = () => {
  return useQuery({
    queryKey: ["leaves"],
    queryFn: () => getAllLeaves(),
  });
};
