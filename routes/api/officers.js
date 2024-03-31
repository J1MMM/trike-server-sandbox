const express = require("express");
const verifyRoles = require("../../middleware/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");
const {
  getAllOfficer,
  addOfficer,
  updateOfficer,
  deleteOfficer,
} = require("../../controllers/officersController");
const router = express.Router();

router
  .route("/")
  .get(getAllOfficer)
  .post(addOfficer)
  .put(updateOfficer)
  .delete(deleteOfficer);

module.exports = router;
