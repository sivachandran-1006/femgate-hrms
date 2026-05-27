import axios from "axios";

const API =
  "http://localhost:5000";

const getToken = () => {

  return localStorage.getItem(
    "token"
  );

};

export const fetchEmployeesAPI =
  async () => {

    const response =
      await axios.get(

        `${API}/employees`,

        {
          headers: {
            authorization:
              getToken(),
          },
        }

      );

    return response.data;

};

export const addEmployeeAPI =
  async (employeeData) => {

    const response =
      await axios.post(

        `${API}/employees`,

        employeeData,

        {
          headers: {
            authorization:
              getToken(),
          },
        }

      );

    return response.data;

};

export const updateEmployeeAPI =
  async (
    id,
    employeeData
  ) => {

    const response =
      await axios.put(

        `${API}/employees/${id}`,

        employeeData,

        {
          headers: {
            authorization:
              getToken(),
          },
        }

      );

    return response.data;

};

export const deleteEmployeeAPI =
  async (id) => {

    const response =
      await axios.delete(

        `${API}/employees/${id}`,

        {
          headers: {
            authorization:
              getToken(),
          },
        }

      );

    return response.data;

};