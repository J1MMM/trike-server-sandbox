const express = require("express");
const router = express.Router();
const {
  getAllFranchise,
  getAllArchived,
  archiveFranchise,
  getAllAvailableMTOPs,
  addNewFranchise,
} = require("../../controllers/franchiseController");

router
  .route("/")
  .get(getAllFranchise)
  .patch(archiveFranchise)
  .post(addNewFranchise);
router.route("/archive").get(getAllArchived);
router.route("/available").get(getAllAvailableMTOPs);

module.exports = router;
