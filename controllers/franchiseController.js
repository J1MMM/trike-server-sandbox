const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const Franchise = require("../model/Franchise");
const PendingFranchise = require("../model/PendingFranchise");
// Set the timezone to UTC
dayjs.extend(utc);
dayjs.extend(timezone);

function getMonthName(monthNumber) {
  const monthNames = [
    "Oct", // 0 maps to October
    "Jan", // 1 maps to January
    "Feb", // 2 maps to February
    "Mar", // 3 maps to March
    "Apr", // 4 maps to April
    "May", // 5 maps to May
    "Jun", // 6 maps to June
    "Jul", // 7 maps to July
    "Aug", // 8 maps to August
    "Sept", // 9 maps to September
  ];

  if (monthNumber < 0 || monthNumber > 9) {
    return "Invalid month number";
  }

  return `${monthNames[monthNumber]}`;
}

function getLastDigit(plateNumber) {
  // Iterate from the end of the string to the beginning
  for (let i = plateNumber.length - 1; i >= 0; i--) {
    // Check if the current character is a digit
    if (!isNaN(plateNumber[i]) && plateNumber[i] !== " ") {
      return plateNumber[i];
    }
  }
  // If no digit is found, return an appropriate message or value
  return "No digit found";
}

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
function getRenewalDate(plateNumber, lastRenewalDate = new Date()) {
  if (!plateNumber || !lastRenewalDate) {
    return null;
  }
  // Extract the last digit from the plate number
  const lastDigit = plateNumber.match(/\d(?=\D*$)/);
  if (!lastDigit) {
    return null;
  }

  // Map last digit to corresponding month (1-based index)
  const monthMap = {
    0: 10, // October
    1: 1, // January
    2: 2, // February
    3: 3, // March
    4: 4, // April
    5: 5, // May
    6: 6, // June
    7: 7, // July
    8: 8, // August
    9: 9, // September
  };

  const month = monthMap[lastDigit[0]];
  const renewalBaseDate = new Date(lastRenewalDate);
  const nextYear = renewalBaseDate.getFullYear() + 1;

  // Create a date for the first day of the next month
  const firstDayOfNextMonth = new Date(nextYear, month, 1);
  // Subtract one day to get the last day of the target month
  const lastDayOfMonth = new Date(firstDayOfNextMonth - 1);

  return lastDayOfMonth;
}

const getAllFranchise = async (req, res) => {
  try {
    const rows = await Franchise.find({ isArchived: false }).sort({
      MTOP: "asc",
    });

    const updatedRows = rows.map((row) => {
      const lto_date = getRenewalDate(row.PLATE_NO, row.DATE_RENEWAL);

      row.LTO_RENEWAL_DATE = lto_date;
      return row;
    });

    await Promise.all(updatedRows.map((row) => row.save()));

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
    console.log(franchiseDetails);
    if (
      !franchiseDetails.mtop ||
      !franchiseDetails.date ||
      !franchiseDetails.fname ||
      !franchiseDetails.lname ||
      !franchiseDetails.address ||
      !franchiseDetails.contact ||
      !franchiseDetails.drivername ||
      !franchiseDetails.driveraddress ||
      !franchiseDetails.make ||
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

    // console.log(latestPendingFranchise);
    if (latestPendingFranchise.length > 0) {
      // Convert refNo to a number
      latestRefNo = parseInt(latestPendingFranchise[0].refNo) + 1;
    } else {
      latestRefNo = 154687;
    }
    const receiptData = [
      { label: "Mayor's Permit", price: 385.0, displayPrice: "385.00" },
      { label: "Franchise Tax", price: 110.0, displayPrice: "110.00" },
      { label: "Health / S.S.F.", price: 63.8, displayPrice: "63.80" },
      { label: "Sticker - Color Coding", price: 55.0, displayPrice: "55.00" },
      { label: "Docket/Filing", price: 55.0, displayPrice: "27.50/27.50" },
      // { label: "Docket Fee", price: 27.5 },
      // { label: "Filing Fee", price: 27.5 },
      {
        label: "Tin Plate/Registration",
        price: 345.0,
        displayPrice: "330.00/15.00",
      },
      // { label: "Registration Fee", price: 15.0 },
      { label: "Sticker for Garbage", price: 50.0, displayPrice: "50.00" },
      {
        label: "Garbage/Notarial Fee",
        price: 50.0,
        displayPrice: "50.00/0.00",
      },
      // { label: "Notarial Fee", price: 0.0 },
    ];

    const lto_date = getRenewalDate(franchiseDetails.plateno, dateRenewal);

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
      MAKE: franchiseDetails.make,
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
      receiptData: receiptData,
      LTO_RENEWAL_DATE: lto_date,
    });

    res.status(201).json(latestRefNo);
  } catch (error) {
    console.error("Error adding new franchise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// transfer franchise
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

    const foundFranchise = await Franchise.findOne({
      _id: franchiseDetails.id,
      isArchived: false,
    });

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
      MAKE: franchiseDetails.make,
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
      renewedAt: foundFranchise.renewedAt,
      LTO_RENEWAL_DATE: getRenewalDate(franchiseDetails.plateno, dateRenewal),
    });

    await Franchise.findByIdAndUpdate(franchiseDetails.id, { pending: true,

          receiptData:receiptData,
    transaction:"Transfer Franchise"
     });

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

    let mayors_permit = 385.0;
    let surcharge1 = 0;
    let franchise = 110.0;
    let surcharge2 = 0;
    let interest = 0;
    let health = 63.8;
    let sticker = 55;
    let docket = 27.5;
    let filing = 27.5;
    let garbage = 50.0;
    // //generate receipt data
    // const initialreceiptData = [
    //   { key: "1", label: "Mayor's Permit", price: mayors_permit },
    //   { key: "2", label: "Surcharge", price: surcharge1 },
    //   {
    //     key: "3",
    //     label: "Franchise",
    //     price: franchise,
    //   },
    //   {
    //     key: "4",
    //     label: "Surcharge",
    //     price: surcharge2,
    //   },
    //   { key: "5", label: "Interest", price: interest },
    //   { key: "6", label: "Health / S.S.F.", price: health },
    //   {
    //     key: "7",
    //     label: "Sticker / Docket Feee",
    //     price: sticker + docket,
    //     displayPrice: `${sticker.toLocaleString("en-PH", {
    //       style: "currency",
    //       currency: "PHP",
    //     })}/${docket.toLocaleString("en-PH", {
    //       style: "currency",
    //       currency: "PHP",
    //     })}`,
    //   },
    //   {
    //     key: "11",
    //     label: "Filing/Garbage/Notarial",
    //     price: filing + garbage,
    //     displayPrice: `${filing.toLocaleString("en-PH", {
    //       style: "currency",
    //       currency: "PHP",
    //     })}/${garbage.toLocaleString("en-PH", {
    //       style: "currency",
    //       currency: "PHP",
    //     })}`,
    //   },
    // ];
    // Get the current date and time
    const dateNow = dayjs().tz("Asia/Kuala_Lumpur");
    let monthsPassed = undefined;

    // const franchiseTax = 110.0;
    // const surcharge = franchiseTax * 0.25;
    // const interest = (franchiseTax + surcharge) * 0.02;
    // console.log(franchiseTax);
    // console.log(surcharge);
    // console.log(interest);

    const foundFranchise = await Franchise.findOne({
      _id: franchiseDetails.id,
      isArchived: false,
    });

    const dateRenew = dayjs(franchiseDetails?.date).tz("Asia/Kuala_Lumpur");
    const lto_date = getRenewalDate(
      franchiseDetails?.plateno,
      foundFranchise?.DATE_RENEWAL
    );
    // Get the expiration date from foundFranchise (assuming DATE_EXPIRED is the property)
    const expirationDate = dayjs(lto_date).tz("Asia/Kuala_Lumpur");

    // Check if the expiration date is in the past
    if (expirationDate.isBefore(dateRenew)) {
      monthsPassed = dateRenew.diff(expirationDate, "month") + 1;
      // console.log(`Months passed since expiration: ${monthsPassed}`);
    }

    console.log(monthsPassed);
    if (monthsPassed < 12 && monthsPassed >= 1) {
      surcharge1 = mayors_permit * 0.5;
      surcharge2 = franchise * 0.25;
      interest = surcharge2 * 0.1 * monthsPassed;
    }
    if (monthsPassed >= 12) {
      let months_1year_passed = monthsPassed - 12;
      mayors_permit *= 2;
      health *= 2;
      sticker *= 2;
      docket *= 2;
      filing *= 2;
      garbage *= 2;

      surcharge1 = mayors_permit * 0.5;
      surcharge2 = franchise * 0.25;

      interest = surcharge2 * 0.1 * 12;
      if (months_1year_passed >= 1) {
        interest += surcharge2 * 0.2 * months_1year_passed;
      }

      franchise *= 2;
      surcharge2 = franchise * 0.25;
    }

    const receiptData = [
      { key: "1", label: "Mayor's Permit", price: mayors_permit },
      { key: "2", label: "Surcharge", price: surcharge1 },
      {
        key: "3",
        label: "Franchise",
        price: franchise,
      },
      {
        key: "4",
        label: "Surcharge",
        price: surcharge2,
      },
      { key: "5", label: "Interest", price: interest },
      { key: "6", label: "Health / S.S.F.", price: health },
      {
        key: "7",
        label: "Sticker / Docket Fee",
        price: sticker + docket,
        displayPrice: `${sticker.toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        })}/${docket.toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        })}`,
      },
      {
        key: "11",
        label: "Filing/Garbage/Notarial",
        price: filing + garbage,
        displayPrice: `${filing.toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        })}/${garbage.toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        })}`,
      },
    ];

    // const receiptData = initialreceiptData.map((v) => {
    //   if (v.label == "Interest") {
    //     return {
    //       ...v,
    //       price: monthsPassed == 0 ? interest : interest * monthsPassed,
    //     };
    //   } else {
    //     return v;
    //   }
    // });

    const sameRenewalDate = isSameDay(
      franchiseDetails.date,
      foundFranchise.DATE_RENEWAL
    );

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
      MAKE: franchiseDetails.make,
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
      renewedAt: !sameRenewalDate ? renewdate : foundFranchise.renewedAt,
      refNo: refNo,
      receiptData: receiptData,
      transaction: "Franchise Renewal",
      LTO_RENEWAL_DATE: foundFranchise.LTO_RENEWAL_DATE,
    });

    foundFranchise.pending = true;
    foundFranchise.receiptData = receiptData;
    foundFranchise.transaction ="Franchise Renewal"
    await foundFranchise.save();

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
    const result = await PendingFranchise.find({ isArchived: true }).sort({
      refNo: "desc",
    });

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
    const paymentOrDate = dayjs(franchiseDetails?.paymentOrDate).tz(
      "Asia/Kuala_Lumpur"
    );

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
      MAKE: foundPending?.MAKE,
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
      paymentOr: franchiseDetails?.paymentOr,
      paymentOrDate: paymentOrDate,
      pending: false,
      receiptData: foundPending?.receiptData,
      LTO_RENEWAL_DATE: foundPending.LTO_RENEWAL_DATE,
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
        },
        {
          isArchived: true,
          DATE_ARCHIVED: dateNow,
        }
      );

      newFranchiseData = await Franchise.create(franchiseObj);
    }

    foundPending.isArchived = true;
    foundPending.paymentOr = franchiseDetails?.paymentOr;
    foundPending.paymentOrDate = paymentOrDate;
    await foundPending.save();
    res.json({ newFranchiseData, receiptData: foundPending?.receiptData });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const cancelOR = async (req, res) => {
  try {
    const franchiseDetails = req.body;
    if (!franchiseDetails)
      return res
        .status(400)
        .json({ message: "Important franchise details are required." });

    const foundFranchise = await Franchise.findOne({
      MTOP: franchiseDetails.mtop,
      isArchived: false,
      pending: true,
    });

    if (foundFranchise) {
      foundFranchise.pending = false;

      await foundFranchise.save();
    }

    await PendingFranchise.findByIdAndDelete(franchiseDetails.id);

    res.json({ message: "ok" });
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
  cancelOR,
};
