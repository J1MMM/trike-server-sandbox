const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  ticketNo: {
    type: String,
    required: false,
  },
  tctNo: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  firstname: {
    type: String,
    required: false,
  },
  mname: {
    type: String,
    required: false,
  },
  dateReleased: {
    type: "date",
    required: false,
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
