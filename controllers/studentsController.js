const Student = require("../model/Student");
const bcrypt = require('bcrypt')
const User = require('../model/User')
const ROLES_LIST = require('../config/roles_list')

const getAllStudents = async (req, res) => {
    const id = req.id;
    const isAdmin = Boolean(req.roles.includes(ROLES_LIST.Admin))
    if(!id && !Admin) return res.status(400).json({"message": "User ID is required"}) 

    try {
        let result = await Student.find({"teacherID": id})

        if(isAdmin){
            result = await Student.find()
        }

        if (!result) return res.status(204).json({ "message": "No students found" })
        res.json(result)
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const createNewStudent = async (req, res) => {
    const { firstname, lastname, middlename, email, password, learning_disabilities } = req.body;
    const userID = req.id;
    const instructor = req.fullname;

    if (!firstname || !lastname || !email || !password || !learning_disabilities || !userID || !instructor) return res.status(400).json({ "message": "All Fields are required" })

    const duplicate = await Student.findOne({ "email": email }).exec()
    if (duplicate) return res.sendStatus(409) //Conflict

    try {
        const hashedPwd = await bcrypt.hash(password, 10)

        const result= await Student.create({
            "firstname": firstname,
            "lastname": lastname,
            "middlename": middlename,
            "email": email,
            "password": hashedPwd,
            "learning_disabilities": learning_disabilities,
            "teacherID": userID,
            "instructor": instructor
        })
        res.status(201).json({ "success": `New student ${firstname} has been created successfully!`, result })
    } catch (error) {
        console.log(error)
        res.status(400).json({ "message": error.message })
    }
}

const updateStudent = async (req, res) => {
    if (!req.body?.id || !req.body?.learning_disabilities) return res.status(400).json({ "message": "ID are required" })

    try {
        const student = await Student.findOne({ _id: req.body.id }).exec();
        let pwdMatch = false;

        if(req?.body?.password){
            pwdMatch = await bcrypt.compare(req.body.password, student.password)
        }else{
            pwdMatch = true
        }

        function arraysHaveSameValues(arr1, arr2) {
          if (arr1.length !== arr2.length) {
            return false;
          }

          return arr1.every(value => arr2.includes(value));
        }

        const sameLD = arraysHaveSameValues(student.learning_disabilities, req?.body?.learning_disabilities)

        if(student.firstname == req?.body?.firstname && student.lastname == req?.body?.lastname && student.middlename == req?.body?.middlename && student.email == req?.body?.email && sameLD && pwdMatch) return res.status(304).json({"message": `No changes for user with email: ${student.email}`})

        const duplicate = await Student.findOne({email: req.body.email}).exec()
        if(duplicate && duplicate._id != req.body.id) return res.status(409).json({'message': 'Email address already in use'})

        if (req?.body?.firstname) student.firstname = req.body.firstname
        if (req?.body?.lastname) student.lastname = req.body.lastname
        if (req?.body?.middlename) student.middlename = req.body.middlename
        if(req?.body?.middlename?.trim() === ""){
            student.middlename = "";
        }
        if (req?.body?.email) student.email = req.body.email
        if (req?.body?.password) student.password = await bcrypt.hash(req.body.password, 10);
        if (req?.body?.learning_disabilities) student.learning_disabilities = req.body.learning_disabilities

        const result = await student.save();
        res.json({"success": "Student updated successfully!", result})
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const deleteStudent = async (req, res) => {
    const { idsToDelete } = req.body
    if (!idsToDelete) return res.sendStatus(400)

    try {
        await Student.deleteMany({_id: {$in: idsToDelete}})

        res.sendStatus(204)
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }
}

const getStudent = async(req, res) => {
    const {id} = req.params;
    if(!id) return res.sendStatus(400);

    try{
        const result = await Student.findOne({_id: id})
        if(!result) return res.sendStatus(204)

        res.json(result)
    }catch(err){
        console.log(err)
        res.sendStatus(400)
    }
}

module.exports = {
    getAllStudents,
    createNewStudent,
    updateStudent,
    deleteStudent,
    getStudent
}