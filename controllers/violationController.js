const bcrypt = require("bcrypt");
const Class = require("../model/Class");
const User = require("../model/User");
const Lesson = require("../model/Lesson");
const Student = require("../model/Student");
const { storage } = require("../config/firebase.config");
const { ref, deleteObject } = require("firebase/storage");
const nodeMailer = require("nodemailer");
const ROLES_LIST = require("../config/roles_list");
const Officer = require("../model/Officer");
const ViolationList = require("../model/ViolationList");
const Violation = require("../model/Violation");
const Franchise = require("../model/Franchise");

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

const getViolationList = async (req, res) => {
  try {
    const result = await ViolationList.find();
    if (!result) return res.status(204).json({ message: "Empty List" });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getViolations = async (req, res) => {
  try {
    const result = await Violation.find().sort({ _id: "desc" });

    if (!result) return res.status(204).json({ message: "Empty List" });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addViolator = async (req, res) => {
  try {
    const violationDetails = req.body;
    if (!violationDetails) return res.sendStatus(400);

    const newViolator = await Violation.create(violationDetails);

    await Officer.findOneAndUpdate(
      { fullname: violationDetails?.officer },
      {
        $inc: { apprehended: 1 },
      }
    );
    if (violationDetails.franchiseNo) {
      const violations = violationDetails.violation.map((obj) => obj.violation);

      const foundFranchise = await Franchise.findOne({
        MTOP: violationDetails.franchiseNo,
        isArchived: false,
      });

      if (foundFranchise) {
        let allViolations = [...foundFranchise.COMPLAINT, ...violations];
        const containsOthers = allViolations.find((v) => v == "OTHERS");
        if (containsOthers) {
          allViolations = allViolations.map((violation) => {
            if (violation == "OTHERS") {
              return violationDetails.remarks;
            } else {
              return violation;
            }
          });
        }
        foundFranchise.COMPLAINT = allViolations;
        if (allViolations.length > 4) {
          const dateNow = new Date();
          foundFranchise.DATE_ARCHIVED = dateNow;
          foundFranchise.isArchived = true;
        }
        foundFranchise.save();
      }
    }

    res.status(201).json(newViolator);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateViolation = async (req, res) => {
  try {
    const violationDetails = req.body;
    if (!violationDetails) return res.sendStatus(400);

    const oldRecord = await Violation.findById(violationDetails._id);
    if (!oldRecord) return res.sendStatus(400);

    if (oldRecord.officer != violationDetails?.officer) {
      await Officer.findOneAndUpdate(
        { fullname: violationDetails?.officer },
        { $inc: { apprehended: 1 } }
      );
      await Officer.findOneAndUpdate(
        { fullname: oldRecord.officer },
        { $inc: { apprehended: -1 } }
      );
    }

    const oldViolations = oldRecord.violation.map((obj) => obj.violation);
    let violations = violationDetails.violation.map((obj) => obj.violation);
    const containsOthers = violations.find((v) => v == "OTHERS");
    if (containsOthers) {
      violations = violations.map((violation) => {
        if (violation == "OTHERS") {
          return violationDetails.remarks;
        } else {
          return violation;
        }
      });
    }

    if (violationDetails.franchiseNo) {
      if (violationDetails.franchiseNo == oldRecord.franchiseNo) {
        const franchise = await Franchise.findOne({
          MTOP: violationDetails.franchiseNo,
          isArchived: false,
        });
        if (franchise) {
          const newArr = franchise.COMPLAINT.filter(
            (item) => !oldViolations.includes(item)
          );
          const mergeArr = [...newArr, ...violations];
          franchise.COMPLAINT = mergeArr;
          franchise.save();
        }
      }
      if (violationDetails.franchiseNo != oldRecord.franchiseNo) {
        const newFranchise = await Franchise.findOne({
          MTOP: violationDetails.franchiseNo,
          isArchived: false,
        });

        if (newFranchise) {
          newFranchise.COMPLAINT = [...newFranchise.COMPLAINT, ...violations];
          newFranchise.save();
        }

        const oldFranchise = await Franchise.findOne({
          MTOP: oldRecord.franchiseNo,
          isArchived: false,
        });

        if (oldFranchise) {
          oldFranchise.COMPLAINT = oldFranchise.COMPLAINT.filter(
            (item) => !oldViolations.includes(item)
          );
          oldFranchise.save();
        }
      }
    }

    if (!violationDetails.franchiseNo && oldRecord.franchiseNo) {
      const franchiseRecord = await Franchise.findOne({
        MTOP: oldRecord.franchiseNo,
        isArchived: false,
      });

      if (franchiseRecord) {
        franchiseRecord.COMPLAINT = franchiseRecord.COMPLAINT.filter(
          (item) => !oldViolations.includes(item)
        );
        franchiseRecord.save();
      }
    }

    oldRecord.set(violationDetails);
    await oldRecord.save();

    res.status(201).json(oldRecord);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getViolationList,
  addViolator,
  getViolations,
  updateViolation,
};
