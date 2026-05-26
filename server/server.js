const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");



const app = express();
mongoose
  .connect(
    "mongodb://127.0.0.1:27017/hrms"
  )
  .then(() => {

    console.log(
      "MongoDB Connected"
    );

  })
  .catch((err) => {

    console.log(err);

  });

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(
  "mongodb://127.0.0.1:27017/hrms"
)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log(err);
});

// Employee Schema
const employeeSchema =
  new mongoose.Schema({

    name: String,
    department: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    joiningDate: String,
    salary: String,
    status: String,

  });
  const leaveSchema =
  new mongoose.Schema({

    employee: String,

    leaveType: String,

    fromDate: String,

    toDate: String,

    reason: String,

    status: {
      type: String,
      default: "Pending",
    },

  });

const Leave =
  mongoose.model(
    "Leave",
    leaveSchema
  );
  const attendanceSchema =
  new mongoose.Schema({

    employee: String,

    department: String,

    checkIn: String,

    checkOut: String,

    date: String,

    status: {
      type: String,
      default: "Present",
    },

  });

const Attendance =
  mongoose.model(
    "Attendance",
    attendanceSchema
  );

// Employee Model
const Employee = mongoose.model(
  "Employee",
  employeeSchema
);

// LOGIN API
app.post(
  "/login",
  async (req, res) => {

    try {

      const employee =
        await Employee.findOne({
          email:
            req.body.email,
        });

      if (!employee) {

        return res.status(401).json({
          message:
            "Invalid Email",
        });

      }

      const isMatch =
        await bcrypt.compare(
          req.body.password,
          employee.password
        );

      if (!isMatch) {

        return res.status(401).json({
          message:
            "Invalid Password",
        });

      }

      const token =
        jwt.sign(

          {
            id: employee._id,

            role: employee.role,
          },

          JWT_SECRET,

          {
            expiresIn: "1d",
          }

        );

      res.json({

        token,

        role:
          employee.role,

        employee,

      });

    } catch (error) {

      res.status(500).json({
        error:
          error.message,
      });

    }

  }
);
// GET Employees
app.get("/employees", async (req, res) => {

  const employees =
    await Employee.find();

  res.json(employees);

});

// ADD Employee
app.post("/employees", async (req, res) => {
  const hashedPassword =
  await bcrypt.hash(
    req.body.password,
    10
  );



const employee =
  new Employee({

    ...req.body,

    password:
      hashedPassword,

  });

await employee.save();

res.json(employee);
});

// UPDATE Employee
app.put("/employees/:id", async (req, res) => {

  const updatedEmployee =
    await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

  res.json(updatedEmployee);

});

// DELETE Employee
app.delete("/employees/:id", async (req, res) => {

  await Employee.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "Deleted",
  });

});

// SERVER
app.post("/apply-leave", async (req, res) => {

  try {

    const leave =
      new Leave(req.body);

    await leave.save();

    res.json({
      message:
        "Leave Applied Successfully",
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }

});
app.put(
  "/leave-status/:id",
  async (req, res) => {

    try {

      await Leave.findByIdAndUpdate(
        req.params.id,
        {
          status:
            req.body.status,
        }
      );

      res.json({
        message:
          "Leave Updated",
      });

    } catch (error) {

      res.status(500).json({
        error:
          error.message,
      });

    }

  }
);
app.post(
  "/attendance",
  async (req, res) => {

    try {

      const attendance =
        new Attendance(
          req.body
        );

      await attendance.save();

      res.json({
        message:
          "Attendance Saved",
      });

    } catch (error) {

      res.status(500).json({
        error:
          error.message,
      });

    }

  }
);
app.get(
  "/attendance",
  async (req, res) => {

    try {

      const attendance =
        await Attendance.find();

      res.json(attendance);

    } catch (error) {

      res.status(500).json({
        error:
          error.message,
      });

    }

  }
);
app.put(
  "/attendance-checkout/:id",
  async (req, res) => {

    try {

      await Attendance.findByIdAndUpdate(
        req.params.id,
        {
          checkOut:
            req.body.checkOut,
        }
      );

      res.json({
        message:
          "Checked Out",
      });

    } catch (error) {

      res.status(500).json({
        error:
          error.message,
      });

    }

  }
);
const JWT_SECRET =
  "mgate_hrms_secret_key";
app.listen(5000, () => {
  app.get("/leaves", async (req, res) => {

  const leaves =
    await Leave.find();

  res.json(leaves);

});
app.post("/leaves", async (req, res) => {

  const leave =
    new Leave(req.body);

  await leave.save();

  res.json(leave);

});
app.put("/leaves/:id", async (req, res) => {

  const updatedLeave =
    await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

  res.json(updatedLeave);

});

  console.log(
    "Server running on port 5000"
  );

});