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
    if (!email || !password || !firstname || !lastname) return res.status(400).json({ "message": "All fields are required" })

    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) return res.status(409).json({"message": 'This Email Address is Already in use'}); //confilict

    try {
        const hashedPwd = await bcrypt.hash(password, 10);

        const result = await User.create({
            "email": email,
            "password": hashedPwd,
            "firstname": firstname,
            "lastname": lastname,
            "middlename": middlename
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

        if(req?.body?.password){
            pwdMatch = await bcrypt.compare(req.body.password, user.password)
        }else{
            pwdMatch = true
        }


        if(user.firstname == req?.body?.firstname && user.lastname == req?.body?.lastname && user.middlename == req?.body?.middlename && user.email == req?.body?.email && pwdMatch) return res.status(304).json({"message": `No changes for user with email: ${user.email}`})

        const duplicate = await User.findOne({email: req.body.email}).exec()
        if(duplicate && duplicate._id != req.body.id) return res.status(409).json({'message': 'Email address already in use'})

        if (req?.body?.firstname) user.firstname = req.body.firstname
        if (req?.body?.lastname) user.lastname = req.body.lastname
        if (req?.body?.middlename) user.middlename = req.body.middlename; 
        if(req?.body?.middlename?.trim() === ""){
            user.middlename = "";
        }
        if (req?.body?.email) user.email = req.body.email
        if (req?.body?.password) user.password = await bcrypt.hash(req.body.password, 10);

        const result = await user.save();
        res.json({"success": "User updated successfully!", result})
    } catch (error) {
        console.log(error)
        res.status(400).json({ "message": error.message })
    }
}

const deleteUser = async (req, res) => {
    const { idsToDelete } = req.body;
    console.log(idsToDelete)
    if (!idsToDelete) return res.sendStatus(400)

    try {
        await User.deleteMany({_id: {$in: idsToDelete}})
        res.status(204).json({ 'message': `Users successfully deleted` })
    } catch (error) {
        res.status(400).json({ 'message': error.message })
    }
}

const getUser = async(req, res) => {
    const {id} = req.params;
    if(!id) return res.sendStatus(400);

    try{
        const user = await User.findOne({_id: id});
        if(!user) return res.sendStatus(204);
        res.json(user)
    }catch(err){
        console.error(err)
    }
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser
}