const express = require("express");
const verifyRoles = require("../../middleware/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");
const {
  getViolationList,
  addViolator,
  getViolations,
  updateViolation,
} = require("../../controllers/violationController");
const router = express.Router();

router.route("/").get(getViolations).post(addViolator).put(updateViolation);
router.route("/list").get(getViolationList);

module.exports = router;
