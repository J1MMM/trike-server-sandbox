const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const Franchise = require("../model/Franchise");
const PendingFranchise = require("../model/PendingFranchise");
// Set the timezone to UTC
dayjs.extend(utc);
dayjs.extend(timezone);

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

function findDuplicateMTOP(arrayOfObjects) {
  const mtopCounts = {}; // Object to store counts of each MTOP

  // Iterate through the array of objects
  arrayOfObjects.forEach((obj) => {
    const mtop = obj.MTOP; // Assuming MTOP property name is 'MTOP'

    // Increment count for the current MTOP
    mtopCounts[mtop] = (mtopCounts[mtop] || 0) + 1;
  });

  // Find MTOPs with counts greater than 1 (indicating duplicates)
  const duplicates = Object.keys(mtopCounts).filter(
    (mtop) => mtopCounts[mtop] > 1
  );

  return duplicates;
}

const getAllFranchise = async (req, res) => {
  try {
    const rows = await Franchise.find({ isArchived: false }).sort({
      MTOP: "asc",
    });
    const totalRows = await Franchise.countDocuments({ isArchived: false });

    // console.log(findDuplicateMTOP(rows));

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
  const datenow = dayjs().tz("Asia/Kuala_Lumpur");
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

    const mtopInPending = await PendingFranchise.find({
      isArchived: false,
      MTOP: { $gte: 0, $lte: 7500 },
    }).distinct("MTOP");

    const allUsedMtop = [...mtopInPending, ...usedFranchises];

    // Generate an array containing all MTOP numbers from 0001 to 7500
    const allMTOPs = Array.from({ length: 7500 }, (_, index) =>
      String(index + 1).padStart(4, "0")
    );

    // Find the missing MTOP numbers by filtering out the used MTOP numbers
    const missingMTOPs = allMTOPs.filter((MTOP) => !allUsedMtop.includes(MTOP));

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
    const datenow = dayjs().tz("Asia/Kuala_Lumpur");
    const dateRenewal = dayjs(franchiseDetails.date).tz("Asia/Kuala_Lumpur");
    const expireDate = datenow.add(1, "year");

    const latestPendingFranchise = await PendingFranchise.find()
      .sort({ refNo: -1 }) // Sort in descending order
      .limit(1);

    let latestRefNo;

    console.log(latestPendingFranchise);
    if (latestPendingFranchise.length > 0) {
      // Convert refNo to a number
      latestRefNo = parseInt(latestPendingFranchise[0].refNo) + 1;
    } else {
      latestRefNo = 154687;
    }
    console.log(latestRefNo);

    // Create a new franchise document and save it to the database
    const newFranchise = await PendingFranchise.create({
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
      refNo: latestRefNo,
      transaction: "New Franchise",
    });

    res.status(201).json(latestRefNo);
  } catch (error) {
    console.error("Error adding new franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleFranchiseTransfer = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (!franchiseDetails) {
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });
    }

    const datenow = dayjs().tz("Asia/Kuala_Lumpur");
    const dateRenewal = dayjs(franchiseDetails.date).tz("Asia/Kuala_Lumpur");
    const expireDate = datenow.add(1, "year");
    let refNo;
    let receiptData = [];
    // generate ref number
    const latestPendingFranchise = await PendingFranchise.find()
      .sort({ refNo: -1 }) // Sort in descending order
      .limit(1);

    if (latestPendingFranchise.length > 0) {
      // Convert refNo to a number
      refNo = parseInt(latestPendingFranchise[0].refNo) + 1;
    } else {
      refNo = 154687;
    }

    if (franchiseDetails.changeOwner) {
      receiptData.push({
        key: receiptData.length,
        label: "CHANGE OF OWNER",
        price: 165.0,
      });
    }

    if (franchiseDetails.changeDriver) {
      receiptData.push({
        key: receiptData.length,
        label: "CHANGE OF DRIVER",
        price: 300.0,
      });
    }

    if (franchiseDetails.changeMotor) {
      receiptData.push({
        key: receiptData.length,
        label: "CHANGE OF MOTOR",
        price: 165.0,
      });
    }

    if (franchiseDetails.changeTODA) {
      receiptData.push({
        key: receiptData.length,
        label: "CHANGE OF TODA",
        price: 165.0,
      });
    }

    // const updatedOldFranchise = await Franchise.findByIdAndUpdate(
    //   franchiseDetails.id,
    //   { isArchived: true, DATE_ARCHIVED: datenow },
    //   { new: true }
    // );

    const newFranchise = await PendingFranchise.create({
      receiptData: receiptData,
      refNo: refNo,
      previousVersion: franchiseDetails.id,
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
      transaction: "Transfer Franchise",
    });

    await Franchise.findByIdAndUpdate(franchiseDetails.id, { pending: true });

    res.status(201).json({ refNo, receiptData });
  } catch (error) {
    console.error("Error transfering franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleFranchiseUpdate = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (!franchiseDetails) {
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });
    }

    const dateRenewal = dayjs(franchiseDetails.date).tz("Asia/Kuala_Lumpur");
    let renewdate = dayjs().tz("Asia/Kuala_Lumpur");
    let expireDate = dateRenewal.add(1, "year");

    const foundFranchise = await Franchise.findOne({
      _id: franchiseDetails.id,
    });

    const sameRenewalDate = isSameDay(
      franchiseDetails.date,
      foundFranchise.DATE_RENEWAL
    );

    if (!sameRenewalDate) {
      foundFranchise.renewedAt = renewdate;
    }

    foundFranchise.pending = true;
    await foundFranchise.save();
    // get ref number
    const latestPendingFranchise = await PendingFranchise.find()
      .sort({ refNo: -1 }) // Sort in descending order
      .limit(1);

    let refNo;

    if (latestPendingFranchise.length > 0) {
      // Convert refNo to a number
      refNo = parseInt(latestPendingFranchise[0].refNo) + 1;
    } else {
      refNo = 154687;
    }

    //generate receipt data
    const initialreceiptData = [
      { key: "1", label: "Mayor's Permit", price: 385.0 },
      { key: "2", label: "Surcharge", price: 192.0 },
      { key: "3", label: "Franchise Tax", price: 110.0 },
      { key: "4", label: "Surcharge", price: 27.5 },
      { key: "5", label: "Interest", price: 0 },
      { key: "6", label: "Health / S.S.F.", price: 63.8 },
      { key: "7", label: "Sticker", price: 55.0 },
      { key: "8", label: "Filing Fee", price: 110.0 },
      { key: "9", label: "Docket Fee", price: 27.5 },
      { key: "10", label: "Filing Fee", price: 110.5 },
      { key: "11", label: "Garbage Fee", price: 50.0 },
      { key: "12", label: "Notarial Fee", price: 100.0 },
    ];
    // Get the current date and time
    const dateNow = dayjs().tz("Asia/Kuala_Lumpur");
    let monthsPassed = 0;
    const dateRenew = dayjs(foundFranchise?.DATE_RENEWAL).tz(
      "Asia/Kuala_Lumpur"
    );
    // Get the expiration date from foundFranchise (assuming DATE_EXPIRED is the property)
    const expirationDate = dateRenew.add(1, "year");

    // Check if the expiration date is in the past
    if (expirationDate.isBefore(dateNow)) {
      // Calculate the number of months that have passed since the expiration date
      monthsPassed = dateNow.diff(expirationDate, "month");

      // console.log(`Months passed since expiration: ${monthsPassed}`);
    }

    const franchiseTax = 110.0;
    const surcharge = franchiseTax * 0.25;
    const interest = (franchiseTax + surcharge) * 0.02;
    console.log(franchiseTax);
    console.log(surcharge);
    console.log(interest);
    const receiptData = initialreceiptData.map((v) => {
      if (v.label == "Interest") {
        return {
          ...v,
          price: monthsPassed == 0 ? interest : interest * monthsPassed,
        };
      } else {
        return v;
      }
    });
    console.log(franchiseDetails);

    const newPendingFranchise = await PendingFranchise.create({
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
      //old fields
      COMPLAINT: foundFranchise.COMPLAINT,
      createdAt: foundFranchise.createdAt,
      MTOP: foundFranchise.MTOP,
      PAID_VIOLATIONS: foundFranchise.PAID_VIOLATIONS,
      previousVersion: foundFranchise._id,
      renewedAt: foundFranchise.renewedAt,
      refNo: refNo,
      receiptData: receiptData,
      transaction: "Franchise Renewal",
    });

    res.json({ refNo, receiptData });
  } catch (error) {
    console.error("Error updating franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const dateNow = dayjs().tz("Asia/Kuala_Lumpur");
    const today = dateNow.startOf("day");
    const numDays = 6;
    const dayNow = dateNow.day();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyFranchiseAnalytics = [];

    for (let i = numDays; i >= 0; i--) {
      const currentDate = dayjs(dateNow)
        .subtract(i, "day")
        .tz("Asia/Kuala_Lumpur");
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
    // get franchises
    const franchises = await Franchise.countDocuments({
      isArchived: false,
    });

    res.json({
      franchises: franchises,
      recentlyAdded: recentlyAdded,
      recentlyRevoked: recentlyRevoked,
      franchiseAnalytics: dailyFranchiseAnalytics,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFranchisePending = async (req, res) => {
  try {
    const result = await PendingFranchise.find({ isArchived: false });

    res.json(result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFranchisePendingPaid = async (req, res) => {
  try {
    const result = await PendingFranchise.find({ isArchived: true });

    res.json(result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const pendingFranchisePayment = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (!franchiseDetails)
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });

    const foundPending = await PendingFranchise.findOne({
      _id: franchiseDetails.id,
    });

    if (!foundPending) res.status(404).json({ message: "record not found" });

    let newFranchiseData;
    const dateNow = dayjs().tz("Asia/Kuala_Lumpur");

    const franchiseObj = {
      MTOP: foundPending?.MTOP,
      LASTNAME: foundPending?.LASTNAME,
      FIRSTNAME: foundPending?.FIRSTNAME,
      MI: foundPending?.MI,
      ADDRESS: foundPending?.ADDRESS,
      DRIVERS_NO: foundPending?.DRIVERS_NO,
      OWNER_NO: foundPending?.OWNER_NO,
      OWNER_SEX: foundPending?.OWNER_SEX,
      TODA: foundPending?.TODA,
      DRIVERS_NAME: foundPending?.DRIVERS_NAME,
      DRIVERS_ADDRESS: foundPending?.DRIVERS_ADDRESS,
      DRIVERS_SEX: foundPending?.DRIVERS_SEX,
      OR: foundPending?.OR,
      CR: foundPending?.CR,
      DRIVERS_LICENSE_NO: foundPending?.DRIVERS_LICENSE_NO,
      MODEL: foundPending?.MODEL,
      MOTOR_NO: foundPending?.MOTOR_NO,
      CHASSIS_NO: foundPending?.CHASSIS_NO,
      PLATE_NO: foundPending?.PLATE_NO,
      STROKE: foundPending?.STROKE,
      FUEL_DISP: foundPending?.FUEL_DISP,
      TPL_PROVIDER: foundPending?.TPL_PROVIDER,
      TPL_DATE_1: foundPending?.TPL_DATE_1,
      TPL_DATE_2: foundPending?.TPL_DATE_2,
      DATE_RELEASE_OF_ST_TP: foundPending?.DATE_RELEASE_OF_ST_TP,
      TYPE_OF_FRANCHISE: foundPending?.TYPE_OF_FRANCHISE,
      KIND_OF_BUSINESS: foundPending?.KIND_OF_BUSINESS,
      ROUTE: foundPending?.ROUTE,
      COMPLAINT: foundPending?.COMPLAINT,
      isArchived: foundPending?.isArchived,
      PAID_VIOLATIONS: foundPending?.PAID_VIOLATIONS,
      DATE_RENEWAL: foundPending?.DATE_RENEWAL,
      DATE_EXPIRED: foundPending?.DATE_EXPIRED,
      createdAt: foundPending?.createdAt,
      DATE_ARCHIVED: foundPending?.DATE_ARCHIVED,
      REMARKS: foundPending?.REMARKS,
      renewedAt: foundPending?.renewedAt,
      paymentOr: foundPending?.paymentOr,
      paymentOrDate: foundPending?.paymentOrDate,
      pending: false,
    };

    if (foundPending.transaction == "New Franchise") {
      newFranchiseData = await Franchise.create(franchiseObj);
    }

    if (foundPending.transaction == "Franchise Renewal") {
      const foundFranchise = await Franchise.findOne({
        _id: foundPending?.previousVersion,
        isArchived: false,
      });

      await foundFranchise.set(franchiseObj);
      newFranchiseData = await foundFranchise.save();
    }

    if (foundPending.transaction == "Transfer Franchise") {
      await Franchise.findOneAndUpdate(
        {
          _id: foundPending?.previousVersion,
          isArchived: false,
          DATE_ARCHIVED: dateNow,
        },
        {
          isArchived: true,
        }
      );

      newFranchiseData = await Franchise.create(franchiseObj);
    }

    foundPending.isArchived = true;
    await foundPending.save();
    res.json({ newFranchiseData, receiptData: foundPending?.receiptData });
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
  getFranchisePending,
  pendingFranchisePayment,
  getFranchisePendingPaid,
};
