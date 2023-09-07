const path = require('path')
const Lesson = require('../model/Lesson')
const ROLES_LIST = require('../config/roles_list')
const fs = require('fs');
const { ref, uploadBytesResumable, getDownloadURL, uploadBytes, deleteObject } = require('firebase/storage');
const { storage } = require('../config/firebase.config');
const axios = require('axios')

const getAllLessons = async (req, res) => {
    const isAdmin = Boolean(req.roles.includes(ROLES_LIST.Admin))
    const id = req.id;
    if (!id) return res.sendStatus(400)

    try {
        let result = await Lesson.find({ teacherID: id }).exec();
        if (isAdmin) {
            result = await Lesson.find()
        }

        res.json(result)
    } catch (err) {
        res.status(400).json({ "message": err.message })

    }
}

const upload = async (req, res) => {
    const title = req.body?.title
    const id = req.id;
    const fullname = req.fullname;
    const filename = req.file?.originalname;
    if (!id || !filename || !title || !fullname) return res.sendStatus(400)

    const allowedExt = ['ppt', 'pptx', 'pptm', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'txt']
    const fileExt = filename.split('.').pop().toLowerCase();
    const filePath = `lessons/${Date.now()}_${filename}`;
    if (!allowedExt.includes(fileExt)) return res.status(401).json({ 'message': 'Invalid file format.' })

    try {
        const storageRef = ref(storage, filePath)
        const metadata = {
            contentType: req.file.mimetype
        }
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata)
        const downloadURL = await getDownloadURL(snapshot.ref)

        const result = await Lesson.create({
            "fileName": filename,
            "teacherID": id,
            "title": title,
            "instructor": fullname,
            "uri": downloadURL,
            "fileType": fileExt,
            "filePath": filePath
        })

        res.status(200).json({ message: 'File uploaded successfully', result });

    } catch (err) {
        res.status(400).json({ "message": err.message })
    }


}

const editLesson = async (req, res) => {
    const { id, file } = req.body;
    if (!id) return res.sendStatus(400)

    try {
        const lesson = await Lesson.findOne({ _id: id }).exec();
        if(!lesson) return res.status(404).json({"message": "File not Found"})

        if (req.file) {
            const fileName = req.file.originalname;
            const filePath = lesson.filePath;
            const allowedExt = ['ppt', 'pptx', 'pptm', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'txt']
            const fileExt = fileName.split('.').pop().toLowerCase();
            if (!allowedExt.includes(fileExt)) return res.status(401).json({ 'message': 'Invalid file format.' })
            // delete file from firebase 
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
            // upload new file 
            const newFilePath = `lessons/${Date.now()}_${fileName}`;
            const newStorageRef = ref(storage, newFilePath)
            const metadata = {
                contentType: req.file.mimetype
            }
            const snapshot = await uploadBytesResumable(newStorageRef, req.file.buffer, metadata)
            const downloadURL = await getDownloadURL(snapshot.ref)

            if(fileName) lesson.fileName = fileName;
            if(newFilePath) lesson.filePath = newFilePath;
            if(fileExt) lesson.fileType = fileExt;
            if(downloadURL) lesson.uri = downloadURL;
        }

        if (req?.body?.title) lesson.title = req.body.title;
        if (req?.filename) lesson.filename = req.filename;

        const result = await lesson.save();
        res.json({ "message": "Lesson update successfully", result })

    } catch (err) {
        res.status(400).json({ "message": err.message })
    }

}

const deleteLesson = async (req, res) => {
    const { id, filePath } = req.body;
    if (!id || !filePath) return res.status(400).json({ "message": "ID and Filename are required" });

    try {
        const result = await Lesson.findByIdAndDelete(id)
        if (!result) return res.status(201).json({ "message": 'File already deleted' });
        
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef)

        res.status(200).json({"message": "File deleted successfully"})
        
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }

}

const viewFile = async(req, res) => {
    const {id} = req.params;
    if(!id) return res.sendStatus(400);

    try{
        console.log(id)
        const foundFile = await Lesson.findOne({ _id: id }).exec();
        console.log(foundFile)
        if(!foundFile) return res.sendStatus(404);

        const filename = foundFile.fileName;
        const uri = foundFile.uri;

         // Download the file from Firebase Storage
        const response = await axios.get(uri, { responseType: 'stream' });

        // Send the downloaded file to the client
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    }catch(err){
        console.log(err)
        res.sendStatus(400)
    }
}

module.exports = { upload, viewFile, getAllLessons, editLesson, deleteLesson }