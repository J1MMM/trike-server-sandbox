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

const computeTotalPrice = (array) => {
  return array.reduce((total, obj) => total + obj?.price, 0);
};

function removeOneItemPerMatch(array1, array2) {
  // Iterate over each item in array1
  array1.forEach((item) => {
    // Find the index of the first occurrence of the item in array2
    const index = array2.findIndex((item2) => item2 === item);
    // If a matching item is found, remove it from array2
    if (index !== -1) {
      array2.splice(index, 1);
    }
  });

  // Return the modified array2
  return array2;
}

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

    const totalPrice = computeTotalPrice(violationDetails?.violation);
    violationDetails.amount = parseInt(totalPrice);

    const newViolator = await Violation.create(violationDetails);

    await Officer.findOneAndUpdate(
      { fullname: violationDetails?.officer },
      {
        $inc: { apprehended: 1 },
      }
    );

    if (violationDetails.franchiseNo) {
      let violations = violationDetails.violation.map((obj) => obj.violation);

      const foundFranchise = await Franchise.findOne({
        MTOP: violationDetails.franchiseNo,
        isArchived: false,
      });

      if (foundFranchise) {
        const containsOthers = violations.find((v) => v == "OTHERS");

        if (containsOthers) {
          violations = violations.map((violation) => {
            if (violation == "OTHERS") {
              return violationDetails.others || "OTHERS";
            } else {
              return violation;
            }
          });
        }

        const allViolations = [...foundFranchise.COMPLAINT, ...violations];
        foundFranchise.COMPLAINT = allViolations;
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

    const prevViolationDetails = await Violation.findById(violationDetails._id);
    if (!prevViolationDetails) return res.sendStatus(400);

    if (prevViolationDetails.officer != violationDetails?.officer) {
      await Officer.findOneAndUpdate(
        { fullname: violationDetails?.officer },
        { $inc: { apprehended: 1 } }
      );
      await Officer.findOneAndUpdate(
        { fullname: prevViolationDetails.officer },
        { $inc: { apprehended: -1 } }
      );
    }

    const prevFranchise = await Franchise.findOne({
      MTOP: prevViolationDetails.franchiseNo,
      isArchived: false,
    });

    const newFranchise = await Franchise.findOne({
      MTOP: violationDetails.franchiseNo,
      isArchived: false,
    });

    let violations = violationDetails.violation?.map((obj) => obj.violation);
    let prevViolations = prevViolationDetails.violation?.map(
      (obj) => obj.violation
    );

    if (violations?.length > 0) {
      const containsOthers = violations.find((v) => v == "OTHERS");

      if (containsOthers) {
        violations = violations.map((violation) => {
          if (violation == "OTHERS") {
            return violationDetails.others || "OTHERS";
          } else {
            return violation;
          }
        });
      }
    }

    if (prevViolations?.length > 0) {
      const containsOthers = prevViolations.find((v) => v == "OTHERS");

      if (containsOthers) {
        prevViolations = prevViolations.map((violation) => {
          if (violation == "OTHERS") {
            return prevViolationDetails.others || "OTHERS";
          } else {
            return violation;
          }
        });
      }
    }

    //check if franchises exist sometimes it already on archive
    if (violationDetails?.franchiseNo) {
      // if franchise number is exist
      console.log("have franchice");
      if (prevViolationDetails.franchiseNo) {
        // if the franchise number of prev violation details is exist
        if (prevViolationDetails.franchiseNo != violationDetails?.franchiseNo) {
          // if franchise number is changed
          console.log("franchise number changed");
          prevFranchise.COMPLAINT = removeOneItemPerMatch(
            prevViolations,
            prevFranchise.COMPLAINT
          );
          newFranchise.COMPLAINT = [...newFranchise.COMPLAINT, ...violations];
        } else {
          console.log("franchise number same as old");
          // if franchiseNo is same as old violationDetails
          const updatedComplaints = removeOneItemPerMatch(
            prevViolations,
            newFranchise.COMPLAINT
          ); // remove old violations from franchise complaints field

          newFranchise.COMPLAINT = [...updatedComplaints, ...violations]; // merge violations to franchise complaints field
        }
      } else {
        // if old violation details have'nt franchise number then new updated had
        console.log("old record have'nt franchise number then now it have");

        newFranchise.COMPLAINT = [...newFranchise.COMPLAINT, ...violations];
      }
    } else {
      // if franchise number is remove
      // if franchise number is remove then the old violationDetails have a franchise number it will remove it the the franchise that has this mtop
      // If there is no franchise number now and the old violationDetails also do not have a franchise number, then no method will be executed.
      if (prevViolationDetails.franchiseNo) {
        console.log(
          "franchise now have not franchise number but old record had"
        );

        prevFranchise.COMPLAINT = removeOneItemPerMatch(
          prevViolations,
          prevFranchise.COMPLAINT
        );
      }
    }

    if (newFranchise) await newFranchise.save();
    if (prevFranchise) await prevFranchise.save();
    console.log("====================================================");

    await prevViolationDetails.set(violationDetails);
    await prevViolationDetails.save();

    res.status(201).json(prevViolationDetails);
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
