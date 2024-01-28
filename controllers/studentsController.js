const Student = require("../model/Student");
const bcrypt = require('bcrypt')
const User = require('../model/User')
const ROLES_LIST = require('../config/roles_list')
const nodeMailer = require('nodemailer')

const getTotalStudents = async (req, res) => {
    console.log('get');
    if (!req.id) return res.status(400).json({ "message": "ID's are required" })

    try {

        const result = await Student.find({ teacherID: req.id, classArchive: false, archive: false })

        res.json(result)
    } catch (error) {
        console.log(error);
        res.status(400).json({ "message": error.message })
    }
}

const getAllStudents = async (req, res) => {
    const { classID } = req.params;

    if (!req.id || !classID) return res.status(400).json({ "message": "ID's are required" })

    try {
        const result = await Student.find({ "teacherID": req.id, "classID": classID })
        if (!result) return res.status(204).json({ "message": "No students found" })
        res.json(result)
    } catch (error) {
        console.log(error);
        res.status(400).json({ "message": error.message })
    }
}

const createNewStudent = async (req, res) => {
    const { firstname, lastname, middlename, username, email, password, learning_disabilities, gender, address, contactNo, birthday, guardian, classID } = req.body;
    const userID = req.id;
    const instructor = req.fullname;
    if (!firstname || !lastname || !email || !username || !password || !learning_disabilities || !userID || !instructor || !gender || !address || !contactNo || !birthday || !guardian || !classID) return res.status(400).json({ "message": "All Fields are required" })

    const duplicateEmail = await Student.findOne({ "email": email }).exec()
    const duplicateUsername = await Student.findOne({ "username": username }).exec()

    if (duplicateEmail) return res.status(409).json({ message: "The email address is already in use" }) //Conflict
    if (duplicateUsername) return res.status(409).json({ message: "The username is already in use" }) //Conflict

    try {
        const hashedPwd = await bcrypt.hash(password, 10)

        const result = await Student.create({
            "firstname": firstname,
            "lastname": lastname,
            "middlename": middlename,
            "username": username,
            "email": email,
            "password": hashedPwd,
            "gender": gender,
            "guardian": guardian,
            "birthday": birthday,
            "contactNo": contactNo,
            "address": address,
            "learning_disabilities": learning_disabilities,
            "teacherID": userID,
            "instructor": instructor,
            "classID": classID
        })

        const transport = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: '587',
            secure: false,
            auth: {
                user: 'devjim.emailservice@gmail.com',
                pass: 'vfxdypfebqvgiiyn'
            }
        })

        const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

                    <style>
                        *{
                            font-family: 'Poppins', sans-serif;
                        }
                        p{
                            font-size: large
                        }
                    </style>
                </head>

                <body>
                   <div style="width: 100%; background-color: #F5F5F3; padding: 80px 10px; box-sizing: border-box">
                        <div style="width: 100%; background-color: #FFF; padding: 30px; max-width: 550px; margin: auto; box-sizing: border-box">
                            <h1 style="margin: 0; text-align: center; font-weight: bold; font-size: xx-large"><span style="color: #2DA544">PPP</span><span style="color: #F75FFF">Kids</span></h1>
                            <h1 style="margin: 0; text-align: center; font-weight: bold; font-size: x-large">Your PPPKids account has been created</h1>

                            <p style="text-align: center; margin-top: 0;">Yay! 🎉 Welcome to PPPKids - the Awesome Educational Game for Kids in PPP! We're super excited to have you join our fun and exciting world of learning adventures.</p>

                            <a href="https://www.mediafire.com/file/y45umlcnui5uxsa/PPPKids.apk/file" style="width: 100%; box-sizing: border-box; display: block; font-size: large; background-color: #2DA544; color: #FFF; padding: 8px 16px; text-decoration: none; font-family: sans-serif; text-align: center; justify-content: center;">Download PPPKids Now!</a>

                        </div>
                    </div>
                </body>
                </html>
        `

        const info = await transport.sendMail({
            from: 'PPPedu <pppedu@email.edu>',
            to: email,
            subject: 'Welcome to PPPKids - Your Learning Journey Begins Here!',
            html: html
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

        if (req?.body?.password) {
            pwdMatch = await bcrypt.compare(req.body.password, student.password)
        } else {
            pwdMatch = true
        }

        function arraysHaveSameValues(arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }

            return arr1.every(value => arr2.includes(value));
        }

        const sameLD = arraysHaveSameValues(student.learning_disabilities, req?.body?.learning_disabilities)

        const birthDate = new Date(req?.body?.birthday)

        if (student.firstname == req?.body?.firstname && student.username == req?.body?.username && student.lastname == req?.body?.lastname && student.middlename == req?.body?.middlename && student.email == req?.body?.email && sameLD && pwdMatch && student.gender == req?.body?.gender && student.guardian == req?.body?.guardian && student.address == req?.body?.address && student.contactNo == req?.body?.contactNo && student.birthday.getTime() == birthDate.getTime()) return res.status(304).json({ "message": `No changes for user with email: ${student.email}` })

        const duplicateEmail = await Student.findOne({ email: req.body.email }).exec()
        const duplicateUsername = await Student.findOne({ username: req.body.username }).exec()

        if (duplicateEmail && duplicateEmail._id != req.body.id) return res.status(409).json({ 'message': 'The email address is already in use' })
        if (duplicateUsername && duplicateUsername._id != req.body.id) return res.status(409).json({ 'message': 'Username is already in use' })

        if (req?.body?.firstname) student.firstname = req.body.firstname
        if (req?.body?.lastname) student.lastname = req.body.lastname
        if (req?.body?.middlename) student.middlename = req.body.middlename
        if (req?.body?.username) student.username = req.body.username
        if (req?.body?.gender) student.gender = req.body.gender
        if (req?.body?.guardian) student.guardian = req.body.guardian
        if (req?.body?.address) student.address = req.body.address
        if (req?.body?.contactNo) student.contactNo = req.body.contactNo
        if (req?.body?.birthday) student.birthday = birthDate
        if (req?.body?.middlename?.trim() === "") {
            student.middlename = "";
        }
        if (req?.body?.email) student.email = req.body.email
        if (req?.body?.password) student.password = await bcrypt.hash(req.body.password, 10);
        if (req?.body?.learning_disabilities) student.learning_disabilities = req.body.learning_disabilities

        const result = await student.save();
        res.json({ "success": "Student updated successfully!", result })
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const deleteStudent = async (req, res) => {
    const { idsToDelete, classID } = req.body

    if (!idsToDelete || !req.id || !classID) return res.sendStatus(400)

    try {
        await Student.deleteMany({ _id: { $in: idsToDelete } })
        const students = await Student.find({ teacherID: req.id, classID: classID });

        res.json(students)
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }
}

const archiveStudent = async (req, res) => {
    const { idsToDelete, toAchive, classID } = req.body
    if (!idsToDelete || !req.id || !classID) return res.status(400).json({ 'message': "id's are required" })

    const updateOperation = {
        $set: {
            archive: toAchive ? true : false
        },
    };

    try {
        await Student.updateMany({ _id: { $in: idsToDelete } }, updateOperation)
        const students = await Student.find({ teacherID: req.id, classID: classID });

        res.json(students)
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ 'message': error.message })
    }
}

const getStudent = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.sendStatus(400);

    try {
        const result = await Student.findOne({ _id: id })
        if (!result) return res.sendStatus(204)

        res.json(result)
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

module.exports = {
    getAllStudents,
    createNewStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    archiveStudent,
    getTotalStudents
}