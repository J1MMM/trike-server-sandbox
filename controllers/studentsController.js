const Student = require("../model/Student");
const bcrypt = require('bcrypt')

const getAllStudents = async (req, res) => {
    try {
        const result = await Student.find();
        if (!result) return res.status(204).json({ "message": "No students found" })
        res.json(result)
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const createNewStudent = async (req, res) => {
    const { firstname, lastname, middlename, email, password } = req.body;
    if (!firstname || !lastname || !middlename || !email || !password) return res.status(400).json({ "message": "All Fields are required" })

    const duplicate = await Student.findOne({ email }).exec()
    if (duplicate) return res.sendStatus(409) //Conflict

    try {
        const hashedPwd = await bcrypt.hash(password, 10)
        const newEmployee = await Student.create({
            "firstname": firstname,
            "lastname": lastname,
            "middlename": middlename,
            "email": email,
            "password": hashedPwd,
        })
        res.json({ "message": `Student ${firstname} was created` })
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const updateStudent = async (req, res) => {
    if (!req.body?.id) return res.status(400).json({ "message": "ID are required" })

    try {
        const student = await Student.findOne({ _id: req.body.id }).exec();

        if (req.body.firstname) student.firstname = req.body.firstname
        if (req.body.lastname) student.lastname = req.body.lastname
        if (req.body.middlename) student.middlename = req.body.middlename

        const result = await student.save();
        res.json(result)
    } catch (error) {
        res.status(400).json({ "message": error.message })
    }
}

const deleteStudent = async (req, res) => {
    const { id } = req.body
    if (!id) return res.sendStatus(400)

    try {
        await Student.findByIdAndDelete(id)
        res.status(204).json({ 'message': `Student with ID: ${id} was deleted` })
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }
}

const getEmployee = (req, res) => {

}

module.exports = {
    getAllStudents,
    createNewStudent,
    updateStudent,
    deleteStudent,
    getEmployee
}