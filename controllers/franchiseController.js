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
    let expireDate = new Date(franchiseDetails.date);
    expireDate = expireDate.setFullYear(expireDate.getFullYear() + 1);

    const updatedFranchise = await Franchise.findByIdAndUpdate(
      franchiseDetails.id,
      {
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
      },
      { new: true }
    );

    res.status(201).json(updatedFranchise);
  } catch (error) {
    console.error("Error updating franchise:", error);
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
};
