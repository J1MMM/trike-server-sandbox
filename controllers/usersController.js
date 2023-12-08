const bcrypt = require('bcrypt');
const User = require('../model/User');
const Lesson = require('../model/Lesson');
const Student = require('../model/Student');
const { storage } = require('../config/firebase.config');
const { ref, deleteObject } = require('firebase/storage');
const nodeMailer = require('nodemailer')

const getAllUsers = async (req, res) => {
    try {
        const result = await User.find();
        if (!result) return res.status(204).json({ "message": "No students found" })
        res.json(result)
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const createUser = async (req, res) => {
    const { email, password, firstname, lastname, middlename, gender, address, contactNo } = req.body;
    if (!email || !password || !firstname || !lastname || !gender || !address || !contactNo) return res.status(400).json({ "message": "All fields are required" })

    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) return res.status(409).json({ "message": 'This Email Address is Already in use' }); //confilict

    try {
        const hashedPwd = await bcrypt.hash(password, 10);

        const result = await User.create({
            "email": email,
            "password": hashedPwd,
            "firstname": firstname,
            "lastname": lastname,
            "middlename": middlename,
            "gender": gender,
            "address": address,
            "contactNo": contactNo,
            "roles": { "Teacher": 1984 }
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
                            <h1 style="margin: 0; text-align: center; font-weight: bold; font-size: xx-large"><span style="color: #2DA544">PPP</span><span style="color: #F75FFF">edu</span></h1>
                            <h1 style="margin: 0; text-align: center; font-weight: bold; font-size: x-large">Your PPPedu account has been created</h1>

                            <p style="text-align: center; margin-top: 0;">Congratulations! 🎉 You have now become a part of PPPedu - The Online Learning Tool. We are absolutely thrilled to welcome you into our vibrant and dynamic learning community.</p>
                        </div>
                    </div>
                </body>
                </html>
        `

        const info = await transport.sendMail({
            from: 'PPPedu <pppedu@email.edu>',
            to: email,
            subject: 'Welcome to PPPedu - Your Learning Journey Begins Here!',
            html: html
        })

        res.status(201).json({ "success": `New user ${firstname} has been created successfully!`, result })

    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const updateUser = async (req, res) => {
    if (!req.body?.id) return res.status(400).json({ "message": "ID are required" })

    try {
        const user = await User.findOne({ _id: req.body.id }).exec();
        let pwdMatch = false;

        if (req?.body?.password) {
            pwdMatch = await bcrypt.compare(req.body.password, user.password)
        } else {
            pwdMatch = true
        }

        if (user.firstname == req?.body?.firstname && user.lastname == req?.body?.lastname && user.middlename == req?.body?.middlename && user.email == req?.body?.email && pwdMatch && req?.body?.gender == user.gender && user.address == req?.body?.address && user.contactNo == req?.body?.contactNo) return res.status(304).json({ "message": `No changes for user with email: ${user.email}` })

        const duplicate = await User.findOne({ email: req.body.email }).exec()
        if (duplicate && duplicate._id != req.body.id) return res.status(409).json({ 'message': 'Email address already in use' })

        if (req?.body?.firstname) user.firstname = req.body.firstname
        if (req?.body?.lastname) user.lastname = req.body.lastname
        if (req?.body?.middlename) user.middlename = req.body.middlename;
        if (req?.body?.gender) user.gender = req.body.gender;
        if (req?.body?.address) user.address = req.body.address;
        if (req?.body?.contactNo) user.contactNo = req.body.contactNo;
        if (req?.body?.middlename?.trim() === "") {
            user.middlename = "";
        }
        if (req?.body?.email) user.email = req.body.email
        if (req?.body?.password) user.password = await bcrypt.hash(req.body.password, 10);

        const updateOperation = {
            $set: {
                instructor: `${user.firstname} ${user.lastname}`,
            },
        };

        const updateLessonIns = {
            $set: {
                instructor: `${user.firstname} ${user.lastname}`,
            },
        };

        await Student.updateMany({ teacherID: req.body.id }, updateOperation)
        await Lesson.updateMany({ teacherID: req.body.id }, updateLessonIns)

        const result = await user.save();
        res.json({ "success": "User updated successfully!", result })
    } catch (error) {
        console.log(error)
        res.status(400).json({ "message": error.message })
    }
}

const deleteUser = async (req, res) => {
    const { idsToDelete } = req.body;
    if (!idsToDelete) return res.sendStatus(400)

    try {
        const fileToDelete = await Lesson.find({ teacherID: { $in: idsToDelete } }).lean().exec()
        const filePaths = fileToDelete.map(lesson => lesson.filePath);

        await User.deleteMany({ _id: { $in: idsToDelete } })
        await Student.deleteMany({ teacherID: { $in: idsToDelete } })
        await Lesson.deleteMany({ teacherID: { $in: idsToDelete } })

        for (const filePath of filePaths) {
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef)
        }

        const result = await User.find();

        res.json(result)
    } catch (error) {
        console.log(error)
        res.status(400).json({ 'message': error.message })
    }
}

const archiveUser = async (req, res) => {
    const { idsToDelete, toAchive } = req.body
    if (!idsToDelete || !req.id) return res.status(400).json({ 'message': "id's are required" })

    const updateOperation = {
        $set: {
            archive: toAchive ? true : false
        },
    };

    try {
        await User.updateMany({ _id: { $in: idsToDelete } }, updateOperation)
        const users = await User.find();

        res.json(users)
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ 'message': error.message })
    }
}

const getUser = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.sendStatus(400);

    try {
        const user = await User.findOne({ _id: id });
        if (!user) return res.sendStatus(204);
        res.json(user)
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    archiveUser
}