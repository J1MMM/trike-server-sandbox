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
  getFranchisePending,
  pendingFranchisePayment,
  getFranchisePendingPaid,
  cancelOR,
  cashierCancelPending,
  franchiseFilter,
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

router.route("/pending").get(getFranchisePending).post(pendingFranchisePayment);
router.route("/cancel").post(cancelOR);
router.route("/cashier-cancel-pending").post(cashierCancelPending);
router.route("/paid").get(getFranchisePendingPaid);
router.route("/filter").get(franchiseFilter);

module.exports = router;
