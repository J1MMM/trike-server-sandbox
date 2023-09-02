const path = require('path')
const Lesson = require('../model/Lesson')
const ROLES_LIST = require('../config/roles_list')
const fs = require('fs');

const getAllLessons = async(req, res) => {
    const isAdmin = Boolean(req.roles.includes(ROLES_LIST.Admin))
    const id = req.id;
    if(!id) return res.sendStatus(400)



    try{
        let result = await Lesson.find({teacherID: id}).exec();
        if(isAdmin){
            result = await Lesson.find()
        }

        res.json(result)
    }catch(err){
        res.status(400).json({ "message": err.message })
        
    }

}

const upload = async(req, res) => {
    const title = req.body?.title
    const id = req.id;
    const filename = req.filename;
    const fullname = req.fullname;
    if(!id || !filename || !title || !fullname) return res.sendStatus(400)

    const allowedExt = ['ppt', 'pptx', 'pptm', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'txt']
    const fileExt = filename.split('.').pop().toLowerCase();

    if(!allowedExt.includes(fileExt)) return res.status(401).json({'message': 'Invalid file format.'})

    try{
        const result = await Lesson.create({
            "filename": filename,
            "teacherID": id,
            "title": title,
            "instructor": fullname

        })

        res.status(200).json({ message: 'File uploaded successfully', result});

    }catch(err){
        res.status(400).json({ "message": err.message })
    }


}

const editLesson = async(req, res) =>{
    const { id, file } = req.body;
    if(!id) return res.sendStatus(400)



    try{
    const lesson = await Lesson.findOne({_id: id}).exec();

    if(req.file){
    const filename = lesson.filename

    const allowedExt = ['ppt', 'pptx', 'pptm', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'txt']
    const fileExt = filename.split('.').pop().toLowerCase();
    if(!allowedExt.includes(fileExt)) return res.status(401).json({'message': 'Invalid file format.'})

    const filePath = path.join(__dirname, '..', 'uploads', 'lessons', filename)
        fs.unlink(filePath, (err) => {
            if (err) {
              return res.status(500).send('Error updating file');
            }
        })
    }

    if (req?.body?.title) lesson.title = req.body.title;
    if (req?.filename) lesson.filename = req.filename;

    const result = await lesson.save();
    res.json({"message": "Lesson update successfully", result})

    }catch(err){
        res.status(400).json({ "message": err.message })
    }

}

const deleteLesson = async(req, res) =>{
    const { id, filename } = req.body;
    if(!id || !filename) return res.status(400).json({"message": "ID and Filename are required"});

    const filePath = path.join(__dirname, '..', 'uploads', 'lessons', filename)
    try {
        const result = await Lesson.findByIdAndDelete(id)
        if(!result) return res.status(201).json({"message": 'File already deleted'});

        fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).send('Error deleting file');
        }

        res.status(204).json({ 'message': `Lesson deleted successfully` })
        })
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }
}

const viewFile = (req, res)=>{
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, '..', 'uploads','lessons', filename))
}

module.exports = { upload, viewFile, getAllLessons, editLesson, deleteLesson }