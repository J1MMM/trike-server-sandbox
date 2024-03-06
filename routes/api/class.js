const express = require('express');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const { createClass, getClasses, archiveClass, updateClass, deleteClass } = require('../../controllers/classController');
const router = express.Router()

router.route('/')
    .get(verifyRoles(ROLES_LIST.CTMO1), getClasses)
    .post(verifyRoles(ROLES_LIST.CTMO1), createClass)
    .put(verifyRoles(ROLES_LIST.CTMO1), updateClass)
    .patch(verifyRoles(ROLES_LIST.CTMO1), archiveClass)
    .delete(verifyRoles(ROLES_LIST.CTMO1), deleteClass)


module.exports = router