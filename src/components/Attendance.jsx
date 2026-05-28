import axios from "axios";
import { useEffect, useState } from "react";

const Attendance = () => {

  const [attendance, setAttendance] =
    useState([]);

  const fetchAttendance =
    async () => {

      try {

        const response =
          await axios.get(
            "http://localhost:5000/attendance"
          );

        setAttendance(
          response.data
        );

      } catch (error) {

        console.log(error);

      }
    };

  useEffect(() => {

    fetchAttendance();

  }, []);

  const handleCheckIn =
    async () => {

      try {

        await axios.post(
          "http://localhost:5000/attendance",
          {
            employee: "Suganthan",
            department: "IT",
            checkIn:
              new Date()
                .toLocaleTimeString(),
            checkOut: "",
            date:
              new Date()
                .toLocaleDateString(),
            status: "Present",
          }
        );

        fetchAttendance();

      } catch (error) {

        console.log(error);

      }
    };

  const handleCheckOut =
    async (id) => {

      try {

        await axios.put(
          `http://localhost:5000/attendance-checkout/${id}`,
          {
            checkOut:
              new Date()
                .toLocaleTimeString(),
          }
        );

        fetchAttendance();

      } catch (error) {

        console.log(error);

      }
    };

  return (

    <div className="bg-white rounded-3xl shadow-xl p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-5xl font-bold">
          Attendance
        </h1>

        <button
          onClick={handleCheckIn}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl"
        >
          Check In
        </button>

      </div>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="text-left py-4">
              Employee
            </th>

            <th className="text-left py-4">
              Department
            </th>

            <th className="text-left py-4">
              Check In
            </th>

            <th className="text-left py-4">
              Check Out
            </th>

            <th className="text-left py-4">
              Status
            </th>

            <th className="text-left py-4">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {attendance.map((item) => (

            <tr
              key={item._id}
              className="border-b"
            >

              <td className="py-5">
                {item.employee}
              </td>

              <td className="py-5">
                {item.department}
              </td>

              <td className="py-5">
                {item.checkIn}
              </td>

              <td className="py-5">
                {item.checkOut || "—"}
              </td>

              <td className="py-5">

                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">

                  {item.status}

                </span>

              </td>

              <td className="py-5">

                <button
                  disabled={item.checkOut}
                  onClick={() =>
                    handleCheckOut(
                      item._id
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-white ${
                    item.checkOut
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Check Out
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

};

export default Attendance;