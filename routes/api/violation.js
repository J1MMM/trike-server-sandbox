const express = require("express");
const verifyRoles = require("../../middleware/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");
const {
  getViolationList,
  addViolator,
  getViolations,
  updateViolation,
  getViolationsPaid,
  updateViolationPaidStatus,
} = require("../../controllers/violationController");
const router = express.Router();

router
  .route("/")
  .get(getViolations)
  .post(addViolator)
  .put(updateViolation)
  .patch(updateViolationPaidStatus);

router.route("/list").get(getViolationList);

router.route("/paid").get(getViolationsPaid);

module.exports = router;
