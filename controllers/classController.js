const Class = require("../model/Class");
const Student = require("../model/Student");
const Lesson = require("../model/Lesson");

const { storage } = require("../config/firebase.config");
const { ref, deleteObject } = require("firebase/storage");

const getClasses = async (req, res) => {
  const teacherID = req.id;

  try {
    const result = await Class.find({ teacherID: teacherID });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  const { section, gradeLevel, schoolYear } = req.body;
  if (!section || !gradeLevel || !schoolYear)
    return res.status(400).json({ message: "All fields are required" });
  const teacherID = req.id;

  try {
    const result = await Class.create({
      teacherID: teacherID,
      section: section,
      gradeLevel: gradeLevel,
      schoolYear: schoolYear,
    });

    res
      .status(201)
      .json({
        success: `New Class '${section}' has been created successfully!`,
        result,
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  const { id, section, schoolYear, gradeLevel } = req.body;
  if (!id) return res.status(400).json({ message: "All fields are required" });

  try {
    const findOne = await Class.findOne({ _id: id }).exec();
    if (!findOne) return res.json({ message: "No Class match" });

    if (section) findOne.section = section;
    if (gradeLevel) findOne.gradeLevel = gradeLevel;
    if (schoolYear) findOne.schoolYear = schoolYear;

    const result = await findOne.save();
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};
const archiveClass = async (req, res) => {
  const { id, toAchive } = req.body;
  if (!id || !req.id)
    return res.status(400).json({ message: "ID's are required" });

  try {
    await Class.updateOne({ _id: id }, { archive: toAchive });
    await Student.updateMany({ classID: id }, { classArchive: toAchive });
    const result = await Class.find({ teacherID: req.id });

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  const { id } = req.body;

  if (!id || !req.id)
    return res.status(400).json({ message: "ID's are required" });
  try {
    const fileToDelete = await Lesson.find({ classID: id }).lean().exec();
    const filePaths = fileToDelete.map((lesson) => lesson.filePath);

    await Class.deleteOne({ _id: id });
    await Student.deleteMany({ classID: id });
    await Lesson.deleteMany({ classID: id });
    const result = await Class.find({ teacherID: req.id, archive: true });

    for (const filePath of filePaths) {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    }

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getClasses,
  archiveClass,
  updateClass,
  deleteClass,
};
