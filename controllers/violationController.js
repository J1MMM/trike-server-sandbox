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
    const result = await Violation.find();

    if (!result) return res.status(204).json({ message: "Empty List" });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addViolator = async (req, res) => {
  try {
    const violationrDetails = req.body;
    if (!violationrDetails) return res.sendStatus(400);

    const newViolator = await Violation.create(violationrDetails);

    res.status(201).json(newViolator);
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
      officerInfo.id,
      {
        callsign: officerInfo.callsign,
        firstname: officerInfo.firstname,
        lastname: officerInfo.lastname,
        mi: officerInfo.mi,
      },
      { new: true }
    );

    res.status(201).json(updatedOfficer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteOfficer = async (req, res) => {
  console.log(req.body.id);
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
  getViolationList,
  addViolator,
  getViolations,
};
