const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authenticate')

//authentication
router.post('/register', userController.register);
router.post('/verify-Email', userController.verifyEmail);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

//feedback
router.post('/submit-feedback', authMiddleware, userController.submitFeedback);
router.get('/get-all-feedback', userController.getAllFeedback);



router.post('/adduser', authMiddleware, userController.addUser);
router.get('/', authMiddleware, userController.getUserByhimself);
router.get('/all-users', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserByid);

router.put('/:id?', authMiddleware, userController.updateUser);
router.delete('/:id?', authMiddleware, userController.deleteUser);


//join group
router.post('/joinGroupRequest', authMiddleware, userController.joinGroupRequest);
router.get('/pending-join-requests/:groupId', authMiddleware, userController.getPendingJoinRequestsByGroup);
// router.get('/pending-join-requests', authMiddleware, userController.getPendingJoinRequestsForAllGroups);

router.post('/accept-join-request', authMiddleware, userController.acceptJoinRequest);
router.put('/update-join-request/:groupId/:userId', authMiddleware, userController.updateJoinRequestStatus);

router.post('/reject-join-request', authMiddleware, userController.rejectJoinRequest);




module.exports = router; 