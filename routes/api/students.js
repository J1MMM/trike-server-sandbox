const express = require('express');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const {    getAllStudenst,
    createNewStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    archiveStudent,
    getTotalStudents} = require('../../controllers/studentsController');
const router = express.Router()

router.route('/')
    .get(verifyRoles(ROLES_LIST.CTMO1), getTotalStudents)
    .patch(verifyRoles(ROLES_LIST.CTMO1), archiveStudent)
    .delete(verifyRoles(ROLES_LIST.CTMO1), deleteStudent)
    .post(verifyRoles(ROLES_LIST.CTMO1), createNewStudent)
    .put(verifyRoles(ROLES_LIST.CTMO1), updateStudent)

router.route('/:classID')
    .get(verifyRoles(ROLES_LIST.CTMO1), getStudent)


// router.route('/:classID/:id')
//     .get(getStudent)

module.exports = router