const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/hrms");

const employeeSchema = new mongoose.Schema({
  name: String,
  department: String,
  status: String,
});

const Employee = mongoose.model(
  "Employee",
  employeeSchema
);

app.get("/employees", async (req, res) => {

  const employees =
    await Employee.find();

  res.json(employees);

});

app.post("/employees", async (req, res) => {

  const employee =
    new Employee(req.body);

  await employee.save();

  res.json(employee);

});

app.delete("/employees/:id", async (req, res) => {

  await Employee.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "Deleted",
  });

});

app.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});