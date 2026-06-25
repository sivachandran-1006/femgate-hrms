const mongoose = require("mongoose");

const leaveSchema =
  new mongoose.Schema({

    employee: String,

    leaveType: String,

    from: String,

    to: String,

    reason: String,

    status: {
      type: String,
      default: "Pending",
    },

  });

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);