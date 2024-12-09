const express = require('express');
const router = express.Router();
const Groups = require('../models/groups');
const userGroupsController = require('../controllers/userGroupsController.js');
const authenticate = require('../middleware/authenticate')
router.post('/leaveGroup', authenticate, userGroupsController.leaveGroup);

router.get('/', authenticate, userGroupsController.getUserGroups);

router.get('/getGroupMembers', authenticate, userGroupsController.getGroupMembers);

module.exports = router;