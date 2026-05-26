const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");



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

// Employee Model
const Employee = mongoose.model(
  "Employee",
  employeeSchema
);

// LOGIN API
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  if (
    email === "admin@mgatetech.com" &&
    password === "admin123"
  ) {

    return res.json({
      success: true,
      role: "Admin",
    });

  }

  if (
    email === "employee@mgatetech.com" &&
    password === "employee123"
  ) {

    return res.json({
      success: true,
      role: "Employee",
    });

  }

  res.status(401).json({
    success: false,
    message: "Invalid Email or Password",
  });

});
// GET Employees
app.get("/employees", async (req, res) => {

  const employees =
    await Employee.find();

  res.json(employees);

});

// ADD Employee
app.post("/employees", async (req, res) => {

  const employee =
    new Employee(req.body);

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