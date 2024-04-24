const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const Franchise = require("../model/Franchise");

const getAllFranchise = async (req, res) => {
  try {
    const rows = await Franchise.find({ isArchived: false }).sort({
      MTOP: "asc",
    });
    const totalRows = await Franchise.countDocuments({ isArchived: false });
    res.json({ rows, totalRows });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllArchived = async (req, res) => {
  try {
    const rows = await Franchise.find({ isArchived: true }).sort({
      DATE_ARCHIVED: "desc",
    });
    const totalRows = await Franchise.countDocuments();
    res.json({ rows, totalRows });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const archiveFranchise = async (req, res) => {
  const { id } = req.body;
  const datenow = new Date();
  try {
    const updatedFranchise = await Franchise.findByIdAndUpdate(
      id,
      { isArchived: true, DATE_ARCHIVED: datenow },
      { new: true } // To return the updated document
    );

    if (!updatedFranchise) {
      return res.status(404).json({ message: "Franchise not found" });
    }
    res.json(updatedFranchise);
  } catch (error) {
    console.error("Error updating franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAvailableMTOPs = async (req, res) => {
  try {
    // Find all available MTOP numbers that are currently assigned to franchises
    const usedFranchises = await Franchise.find({
      isArchived: false,
      MTOP: { $gte: 0, $lte: 7500 },
    }).distinct("MTOP");

    // Generate an array containing all MTOP numbers from 0001 to 7500
    const allMTOPs = Array.from({ length: 7500 }, (_, index) =>
      String(index + 1).padStart(4, "0")
    );

    // Find the missing MTOP numbers by filtering out the used MTOP numbers
    const missingMTOPs = allMTOPs.filter(
      (MTOP) => !usedFranchises.includes(MTOP)
    );

    // Return the array of missing MTOP numbers as JSON response
    return res.json(missingMTOPs);
  } catch (error) {
    console.error("Error getting missing MTOPs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addNewFranchise = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (
      !franchiseDetails.mtop ||
      !franchiseDetails.date ||
      !franchiseDetails.fname ||
      !franchiseDetails.lname ||
      !franchiseDetails.address ||
      !franchiseDetails.contact ||
      !franchiseDetails.drivername ||
      !franchiseDetails.driveraddress ||
      !franchiseDetails.model ||
      !franchiseDetails.plateno ||
      !franchiseDetails.motorno ||
      !franchiseDetails.or ||
      !franchiseDetails.cr
    ) {
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });
    }
    // Check if a document with the same MTOP already exists
    const existingFranchise = await Franchise.findOne({
      MTOP: franchiseDetails.mtop,
      isArchived: false,
    });

    if (existingFranchise) {
      return res.status(400).json({ message: "MTOP already exists" });
    }
    const dateRenewal = new Date(franchiseDetails.date);
    const datenow = new Date();
    let expireDate = new Date(franchiseDetails.date);
    expireDate = expireDate.setFullYear(expireDate.getFullYear() + 1);
    // Create a new franchise document and save it to the database
    const newFranchise = await Franchise.create({
      MTOP: franchiseDetails.mtop,
      DATE_RENEWAL: dateRenewal,
      FIRSTNAME: franchiseDetails.fname,
      LASTNAME: franchiseDetails.lname,
      MI: franchiseDetails.mi,
      ADDRESS: franchiseDetails.address,
      OWNER_NO: franchiseDetails.contact,
      OWNER_SEX: franchiseDetails.ownerSex,
      DRIVERS_NAME: franchiseDetails.drivername,
      DRIVERS_ADDRESS: franchiseDetails.driveraddress,
      DRIVERS_NO: franchiseDetails.contact2,
      DRIVERS_SEX: franchiseDetails.driverSex,
      DRIVERS_LICENSE_NO: franchiseDetails.driverlicenseno,
      MODEL: franchiseDetails.model,
      PLATE_NO: franchiseDetails.plateno,
      MOTOR_NO: franchiseDetails.motorno,
      STROKE: franchiseDetails.stroke,
      CHASSIS_NO: franchiseDetails.chassisno,
      FUEL_DISP: franchiseDetails.fuelDisp,
      OR: franchiseDetails.or,
      CR: franchiseDetails.cr,
      TPL_PROVIDER: franchiseDetails.tplProvider,
      TPL_DATE_1: franchiseDetails.tplDate1,
      TPL_DATE_2: franchiseDetails.tplDate2,
      TYPE_OF_FRANCHISE: franchiseDetails.typeofFranchise,
      KIND_OF_BUSINESS: franchiseDetails.kindofBusiness,
      TODA: franchiseDetails.toda,
      DATE_RELEASE_OF_ST_TP: franchiseDetails.daterelease,
      ROUTE: franchiseDetails.route,
      REMARKS: franchiseDetails.remarks,
      isArchived: false,
      DATE_EXPIRED: expireDate,
      createdAt: datenow,
    });

    res.status(201).json(newFranchise);
  } catch (error) {
    console.error("Error adding new franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleFranchiseTransfer = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (
      !franchiseDetails.mtop ||
      !franchiseDetails.date ||
      !franchiseDetails.fname ||
      !franchiseDetails.lname ||
      !franchiseDetails.address ||
      !franchiseDetails.contact ||
      !franchiseDetails.drivername ||
      !franchiseDetails.driveraddress ||
      !franchiseDetails.model ||
      !franchiseDetails.plateno ||
      !franchiseDetails.motorno ||
      !franchiseDetails.or ||
      !franchiseDetails.cr
    ) {
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });
    }
    const datenow = new Date();
    const dateRenewal = new Date(franchiseDetails.date);
    let expireDate = new Date(franchiseDetails.date);
    expireDate = expireDate.setFullYear(expireDate.getFullYear() + 1);

    const updatedOldFranchise = await Franchise.findByIdAndUpdate(
      franchiseDetails.id,
      { isArchived: true, DATE_ARCHIVED: datenow },
      { new: true }
    );

    const newFranchise = await Franchise.create({
      MTOP: franchiseDetails.mtop,
      DATE_RENEWAL: dateRenewal,
      FIRSTNAME: franchiseDetails.fname,
      LASTNAME: franchiseDetails.lname,
      MI: franchiseDetails.mi,
      ADDRESS: franchiseDetails.address,
      OWNER_NO: franchiseDetails.contact,
      OWNER_SEX: franchiseDetails.ownerSex,
      DRIVERS_NAME: franchiseDetails.drivername,
      DRIVERS_ADDRESS: franchiseDetails.driveraddress,
      DRIVERS_NO: franchiseDetails.contact2,
      DRIVERS_SEX: franchiseDetails.driverSex,
      DRIVERS_LICENSE_NO: franchiseDetails.driverlicenseno,
      MODEL: franchiseDetails.model,
      PLATE_NO: franchiseDetails.plateno,
      MOTOR_NO: franchiseDetails.motorno,
      STROKE: franchiseDetails.stroke,
      CHASSIS_NO: franchiseDetails.chassisno,
      FUEL_DISP: franchiseDetails.fuelDisp,
      OR: franchiseDetails.or,
      CR: franchiseDetails.cr,
      TPL_PROVIDER: franchiseDetails.tplProvider,
      TPL_DATE_1: franchiseDetails.tplDate1,
      TPL_DATE_2: franchiseDetails.tplDate2,
      TYPE_OF_FRANCHISE: franchiseDetails.typeofFranchise,
      KIND_OF_BUSINESS: franchiseDetails.kindofBusiness,
      TODA: franchiseDetails.toda,
      DATE_RELEASE_OF_ST_TP: franchiseDetails.daterelease,
      ROUTE: franchiseDetails.route,
      REMARKS: franchiseDetails.remarks,
      isArchived: false,
      DATE_EXPIRED: expireDate,
      createdAt: datenow,
    });

    res.status(201).json({
      message: "Franchise transferred successfully",
      newFranchise,
      updatedOldFranchise,
    });
  } catch (error) {
    console.error("Error transfering franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function isSameDay(date1, date2) {
  // Parse strings to Date objects if inputs are strings
  if (typeof date1 === "string") {
    date1 = new Date(date1);
  }
  if (typeof date2 === "string") {
    date2 = new Date(date2);
  }

  // Check if the dates are on the same day
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const handleFranchiseUpdate = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (
      !franchiseDetails.mtop ||
      !franchiseDetails.date ||
      !franchiseDetails.fname ||
      !franchiseDetails.lname ||
      !franchiseDetails.address ||
      !franchiseDetails.contact ||
      !franchiseDetails.drivername ||
      !franchiseDetails.driveraddress ||
      !franchiseDetails.model ||
      !franchiseDetails.plateno ||
      !franchiseDetails.motorno ||
      !franchiseDetails.or ||
      !franchiseDetails.cr
    ) {
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });
    }

    const dateRenewal = new Date(franchiseDetails.date);
    let renewdate = new Date();
    let expireDate = new Date(franchiseDetails.date);
    expireDate = expireDate.setFullYear(expireDate.getFullYear() + 1);

    const foundFranchise = await Franchise.findOne({
      _id: franchiseDetails.id,
    });

    const sameRenewalDate = isSameDay(
      franchiseDetails.date,
      foundFranchise.DATE_RENEWAL
    );

    console.log(sameRenewalDate);
    if (!sameRenewalDate) {
      foundFranchise.renewedAt = renewdate;
    }

    foundFranchise.DATE_RENEWAL = dateRenewal;
    foundFranchise.FIRSTNAME = franchiseDetails.fname;
    foundFranchise.LASTNAME = franchiseDetails.lname;
    foundFranchise.MI = franchiseDetails.mi;
    foundFranchise.ADDRESS = franchiseDetails.address;
    foundFranchise.OWNER_NO = franchiseDetails.contact;
    foundFranchise.OWNER_SEX = franchiseDetails.ownerSex;
    foundFranchise.DRIVERS_NAME = franchiseDetails.drivername;
    foundFranchise.DRIVERS_ADDRESS = franchiseDetails.driveraddress;
    foundFranchise.DRIVERS_NO = franchiseDetails.contact2;
    foundFranchise.DRIVERS_SEX = franchiseDetails.driverSex;
    foundFranchise.DRIVERS_LICENSE_NO = franchiseDetails.driverlicenseno;
    foundFranchise.MODEL = franchiseDetails.model;
    foundFranchise.PLATE_NO = franchiseDetails.plateno;
    foundFranchise.MOTOR_NO = franchiseDetails.motorno;
    foundFranchise.STROKE = franchiseDetails.stroke;
    foundFranchise.CHASSIS_NO = franchiseDetails.chassisno;
    foundFranchise.FUEL_DISP = franchiseDetails.fuelDisp;
    foundFranchise.OR = franchiseDetails.or;
    foundFranchise.CR = franchiseDetails.cr;
    foundFranchise.TPL_PROVIDER = franchiseDetails.tplProvider;
    foundFranchise.TPL_DATE_1 = franchiseDetails.tplDate1;
    foundFranchise.TPL_DATE_2 = franchiseDetails.tplDate2;
    foundFranchise.TYPE_OF_FRANCHISE = franchiseDetails.typeofFranchise;
    foundFranchise.KIND_OF_BUSINESS = franchiseDetails.kindofBusiness;
    foundFranchise.TODA = franchiseDetails.toda;
    foundFranchise.DATE_RELEASE_OF_ST_TP = franchiseDetails.daterelease;
    foundFranchise.ROUTE = franchiseDetails.route;
    foundFranchise.REMARKS = franchiseDetails.remarks;
    foundFranchise.isArchived = false;
    foundFranchise.DATE_EXPIRED = expireDate;

    await foundFranchise.save();

    res.status(201).json(foundFranchise);
  } catch (error) {
    console.error("Error updating franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    // Set the timezone to UTC
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.tz.setDefault("UTC");

    const dateNow = dayjs();
    const today = dateNow.startOf("day");
    const numDays = 6;
    const dayNow = dateNow.day();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyFranchiseAnalytics = [];

    for (let i = numDays; i >= 0; i--) {
      const currentDate = dayjs(dateNow).subtract(i, "day").startOf("day");
      const dayofWeek = currentDate.day();
      const start = currentDate.startOf("day").toISOString();
      const end = currentDate.endOf("day").toISOString();

      const added = await Franchise.countDocuments({
        isArchived: false,
        createdAt: { $gte: start, $lte: end },
      });

      const revoked = await Franchise.countDocuments({
        isArchived: true,
        DATE_ARCHIVED: { $gte: start, $lte: end },
      });

      const renewed = await Franchise.countDocuments({
        isArchived: false,
        renewedAt: { $gte: start, $lte: end },
      });

      dailyFranchiseAnalytics.push({
        key: dayofWeek == dayNow ? "Today" : days[dayofWeek],
        added: added,
        renewed: renewed,
        revoked: revoked,
      });
    }
    console.log(today.toISOString());
    // get recentlyAdded
    const recentlyAdded = await Franchise.countDocuments({
      isArchived: false,
      createdAt: { $gte: today.toISOString() },
    });
    // get recentlyRevoked
    const recentlyRevoked = await Franchise.countDocuments({
      isArchived: true,
      DATE_ARCHIVED: { $gte: today.toISOString() },
    });

    res.json({
      recentlyAdded: recentlyAdded,
      recentlyRevoked: recentlyRevoked,
      franchiseAnalytics: dailyFranchiseAnalytics,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllFranchise,
  getAllArchived,
  archiveFranchise,
  getAllAvailableMTOPs,
  addNewFranchise,
  handleFranchiseTransfer,
  handleFranchiseUpdate,
  getAnalytics,
};
