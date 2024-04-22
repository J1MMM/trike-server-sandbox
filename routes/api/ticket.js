const express = require("express");
const verifyRoles = require("../../middleware/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");
const {
  addTicket,
  getAllTickets,
  updateTicket,
} = require("../../controllers/releasedTCTController");
const router = express.Router();

router.route("/").get(getAllTickets).post(addTicket).put(updateTicket);

module.exports = router;
