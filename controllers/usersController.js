const bcrypt = require('bcrypt');
const User = require('../model/User');

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
    const { email, password, firstname, lastname, middlename } = req.body;
    if (!email || !password || !firstname || !lastname || !middlename) return res.status(400).json({ "message": "All fields are required" })

    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) return res.sendStatus(409); //confilict

    try {
        const hashedPwd = await bcrypt.hash(password, 10);

        const result = await User.create({
            "email": email,
            "password": hashedPwd,
            "firstname": firstname,
            "lastname": lastname,
            "middlename": middlename
        })
        console.log(result);
        res.status(201).json({ "success": `New User ${email} Created` })

    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const updateUser = async (req, res) => {
    if (!req.body?.id) return res.status(400).json({ "message": "ID are required" })

    try {
        const user = await User.findOne({ _id: req.body.id }).exec();

        if (req.body.firstname) user.firstname = req.body.firstname
        if (req.body.lastname) user.lastname = req.body.lastname
        if (req.body.middlename) user.middlename = req.body.middlename
        if (req.body.email) user.email = req.body.email
        if (req.body.password) user.password = req.body.password

        const result = await user.save();
        res.json(result)
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.body
    if (!id) return res.sendStatus(400)

    try {
        await User.findByIdAndDelete(id)
        res.status(204).json({ 'message': `Student with ID: ${id} was deleted` })
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}