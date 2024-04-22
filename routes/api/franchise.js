const express = require("express");
const router = express.Router();
const {
  getAllFranchise,
  getAllArchived,
  archiveFranchise,
  getAllAvailableMTOPs,
  addNewFranchise,
  handleFranchiseTransfer,
  handleFranchiseUpdate,
  getAnalytics,
} = require("../../controllers/franchiseController");

router
  .route("/")
  .get(getAllFranchise)
  .patch(archiveFranchise)
  .post(addNewFranchise);
router.route("/archive").get(getAllArchived);
router.route("/available").get(getAllAvailableMTOPs);
router.route("/transfer").post(handleFranchiseTransfer);
router.route("/update").post(handleFranchiseUpdate);
router.route("/analytics").get(getAnalytics);

module.exports = router;
