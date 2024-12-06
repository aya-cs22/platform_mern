const express = require('express');
const router = express.Router();
const Lectures = require('../models/lectures');
const lecturesController = require('../controllers/lecturesController.js');
const authMiddleware = require('../middleware/authenticate');

router.post('/', authMiddleware, lecturesController.creatLectures);
router.get('/', lecturesController.getAllLectures);

// Attendance
router.post('/attend', authMiddleware, lecturesController.attendLecture);
router.get('/get-lecture-attendees', authMiddleware, lecturesController.getLectureAttendees);


// Get lecture by ID
router.get('/:id', lecturesController.getLecturesById);
router.put('/:id', authMiddleware, lecturesController.updateLecturesById);
router.delete('/:id', authMiddleware, lecturesController.deleteLecturesById);
router.post('/:lectureId/createtasks', authMiddleware, lecturesController.createTask);
router.get('/:lectureId/tasks', lecturesController.getTasksByLectureId);
//get Lecture WithTasks AndUsers
router.get('/:lectureId', authMiddleware, lecturesController.getLectureWithTasksAndUsers);

//update and delet task
router.put('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.editTask);
router.delete('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.deleteTask);

// get lecture by groupId only(admi, user, active)
router.get('/group/:groupId/lectures', authMiddleware, lecturesController.getLecturesForGroup);

// Submit task
router.post('/:lectureId/tasks/:taskId/submit', authMiddleware, lecturesController.submitTask);

// score for task
router.put('/evaluate/:lectureId/:taskId', lecturesController.evaluateTask);
router.get('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.getTaskById);
router.get('/tasks/:taskId/submissions', lecturesController.getUsersWhoSubmittedTask);
router.get('/tasks/submitted/:userId', lecturesController.getTasksSubmittedByUser);


module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Lectures = require('../models/lectures');
// const lecturesController = require('../controllers/lecturesController.js');
// const authMiddleware = require('../middleware/authenticate');

// router.post('/', authMiddleware, lecturesController.creatLectures);
// router.get('/', lecturesController.getAllLectures);

// // Attendance
// router.post('/attend', authMiddleware, lecturesController.attendLecture);
// router.get('/get-lecture-attendees', authMiddleware, lecturesController.getLectureAttendees);


// // Get lecture by ID
// router.get('/:id', lecturesController.getLecturesById);
// router.put('/:id', authMiddleware, lecturesController.updateLecturesById);
// router.delete('/:id', authMiddleware, lecturesController.deleteLecturesById);
// router.post('/:lectureId/createtasks', authMiddleware, lecturesController.createTask);
// router.get('/:lectureId/tasks', lecturesController.getTasksByLectureId);
// //get Lecture WithTasks AndUsers
// router.get('/:lectureId', authMiddleware, lecturesController.getLectureWithTasksAndUsers);

// //update and delet task
// router.get('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.getTaskById);
// router.get('/tasks/:taskId/submissions', lecturesController.getUsersWhoSubmittedTask);
// router.put('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.editTask);
// router.delete('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.deleteTask);



// // Submit task
// router.get('/tasks/:taskId/submissions', lecturesController.getUsersWhoSubmittedTask);
// router.post('/:lectureId/tasks/:taskId/submit', authMiddleware, lecturesController.submitTask);

// // score for task
// router.put('/evaluate/:lectureId/:taskId', lecturesController.evaluateTask);



// module.exports = router;
