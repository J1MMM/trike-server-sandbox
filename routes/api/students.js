const express = require('express');
const { getEmployee, getAllStudents, createNewStudent, updateStudent, deleteStudent } = require('../../controllers/studentsController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const router = express.Router()

router.route('/')
    .get(verifyRoles(ROLES_LIST.SuperAdmin, ROLES_LIST.Admin), getAllStudents)
    .post(verifyRoles(ROLES_LIST.SuperAdmin, ROLES_LIST.Admin), createNewStudent)
    .put(verifyRoles(ROLES_LIST.SuperAdmin, ROLES_LIST.Admin), updateStudent)
    .delete(verifyRoles(ROLES_LIST.SuperAdmin, ROLES_LIST.Admin), deleteStudent)

router.route('/:id')
    .get(getEmployee)

module.exports = router