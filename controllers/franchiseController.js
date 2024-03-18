const Franchise = require("../model/Franchise");

const getAllFranchise = async (req, res) => {
  console.log("not archive");
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
  console.log("archive");
  try {
    const rows = await Franchise.find({ isArchived: true }).sort({
      MTOP: "asc",
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

  try {
    const updatedFranchise = await Franchise.findByIdAndUpdate(
      id,
      { isArchived: true },
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

    console.log(usedFranchises.length);
    console.log(allMTOPs.length);

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
    const {
      mtop,
      dateRenewal,
      ownerFname,
      ownerLname,
      ownerMI,
      ownerAddress,
      ownerContact,
      driverFullname,
      driverAddress,
      driverContact,
      model,
      plateno,
      motorno,
      stroke,
      chasisno,
      fueldisp,
      OR,
      CR,
      tplProvider,
      tplDate1,
      tplDate2,
      typeOfFranchise,
      kindOfBusiness,
      toda,
      route,
      remarks,
      complaints,
      DateReleaseOfSTTP,
    } = req.body;

    if (
      !mtop ||
      !dateRenewal ||
      !ownerFname ||
      !ownerLname ||
      !ownerAddress ||
      !ownerContact ||
      !driverFullname ||
      !driverAddress ||
      !driverContact ||
      !model ||
      !plateno ||
      !motorno ||
      !OR ||
      !CR
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if a document with the same MTOP already exists
    const existingFranchise = await Franchise.findOne({
      MTOP: mtop,
      isArchived: false,
    });

    if (existingFranchise) {
      return res.status(400).json({ error: "MTOP already exists" });
    }

    // Create a new franchise document and save it to the database
    const newFranchise = await Franchise.create({
      MTOP: mtop,
      DATE_RENEWAL: dateRenewal,
      FIRSTNAME: ownerFname,
      LASTNAME: ownerLname,
      MI: ownerMI,
      ADDRESS: ownerAddress,
      DRIVERS_NAME: driverFullname,
      DRIVERS_ADDRESS: driverAddress,
      OWNER_NO: ownerContact,
      DRIVER_NO: driverContact,
      MODEL: model,
      PLATE_NO: plateno,
      MOTOR_NO: motorno,
      STROKE: stroke,
      CHASSIS_NO: chasisno,
      FUEL_DISP: fueldisp,
      OR: OR,
      CR: CR,
      TPL_PROVIDER: tplProvider,
      TPL_DATE_1: tplDate1,
      TPL_DATE_2: tplDate2,
      TYPE_OF_FRANCHISE: typeOfFranchise,
      KIND_OF_BUSINESS: kindOfBusiness,
      TODA: toda,
      DATE_RELEASE_OF_ST_TP: DateReleaseOfSTTP,
      ROUTE: route,
      REMARKS: remarks,
      COMPLAINT: complaints,
      isArchived: false,
    });

    res.status(201).json(newFranchise);
  } catch (error) {
    console.error("Error adding new franchise:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllFranchise,
  getAllArchived,
  archiveFranchise,
  getAllAvailableMTOPs,
  addNewFranchise,
};
