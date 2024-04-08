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

const getAllOfficer = async (req, res) => {
  try {
    const result = await Officer.find().sort({
      callsign: "asc",
    });
    if (!result) return res.status(204).json({ message: "No Officers found" });

    // result = await Promise.all(
    //   result.map(async (officer) => {
    //     officer.fullname = `${officer.firstname} ${
    //       officer?.mi && officer?.mi + " "
    //     }${officer.lastname}`;
    //     await officer.save();
    //     return officer;
    //   })
    // );

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addOfficer = async (req, res) => {
  try {
    const officerDetails = req.body;
    if (
      !officerDetails.callsign ||
      !officerDetails.firstname ||
      !officerDetails.lastname
    )
      return res.status(400).json({ message: "All fields are required" });

    const newOfficer = await Officer.create({
      callsign: officerDetails.callsign,
      firstname: officerDetails.firstname,
      lastname: officerDetails.lastname,
      mi: officerDetails.mi,
      fullname: `${officerDetails.firstname} ${
        officerDetails.mi && officerDetails.mi + " "
      }${officerDetails.lastname}`,
    });

    res.status(201).json(newOfficer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateOfficer = async (req, res) => {
  try {
    const officerInfo = req.body;
    if (!officerInfo) return res.sendStatus(400);
    const updatedOfficer = await Officer.findByIdAndUpdate(
      officerInfo._id,
      {
        callsign: officerInfo.callsign,
        firstname: officerInfo.firstname,
        lastname: officerInfo.lastname,
        mi: officerInfo.mi,
        fullname: `${officerInfo.firstname} ${
          officerInfo.mi ? officerInfo.mi + " " : ""
        }${officerInfo.lastname}`, // Corrected the ternary operator
      },
      { new: true }
    );
    console.log(updatedOfficer); // Corrected variable name for logging
    res.status(201).json(updatedOfficer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteOfficer = async (req, res) => {
  if (!req.body.id) return res.sendStatus(400);
  try {
    await Officer.deleteOne({ _id: req.body.id });
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addOfficer,
  getAllOfficer,
  deleteOfficer,
  updateOfficer,
};
