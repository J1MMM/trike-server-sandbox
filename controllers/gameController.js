const Student = require("../model/Student")

const updateStudents = async (req, res) => {
    const { id, stars } = req.body
    if (!id || !stars) return res.status(401).json({ 'message': 'ID and stars is required' })
    try {
        const foundStudent = await Student.findOne({ _id: id }).exec();
        if (!foundStudent) return res.status(401).json({ 'message': 'Student not found' })
        foundStudent.stars = stars;

        await foundStudent.save();
        res.sendStatus(204)
    } catch (error) {
        console.log(error);
    }
}


module.exports = { updateStudents }