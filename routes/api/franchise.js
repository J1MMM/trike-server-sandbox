const express = require("express");
const router = express.Router();
const {
  getAllFranchise,
  getAllArchived,
  archiveFranchise,
  getAllAvailableMTOPs,
} = require("../../controllers/franchiseController");

router.route("/").get(getAllFranchise).patch(archiveFranchise);
router.route("/archive").get(getAllArchived);
router.route("/available").get(getAllAvailableMTOPs);

module.exports = router;
