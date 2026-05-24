const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();

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

// Employee Model
const Employee = mongoose.model(
  "Employee",
  employeeSchema
);

// LOGIN API
app.post("/login", async (req, res) => {

  try {

    const { email, password } =
      req.body;

    const user =
      await User.findOne({
        email,
        password,
      });

    if (!user) {

      return res.status(401).json({
        message:
          "Invalid credentials",
      });

    }

    res.json({
      role: user.role,
      name: user.name,
    });

  } catch (error) {

    res.status(500).json(error);

  }

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
app.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});