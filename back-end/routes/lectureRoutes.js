const express = require('express');
const router = express.Router();
const Lectures = require('../models/lectures');
const lecturesController = require('../controllers/lecturesController.js');
const authMiddleware = require('../middleware/authenticate');

router.post('/', authMiddleware, lecturesController.createLectures);
router.put('/:lectureId', authMiddleware, lecturesController.updateLecturesById);
router.get('/:lectureId', authMiddleware, lecturesController.getLectureById);
router.get('/group/:groupId', authMiddleware, lecturesController.getLecturesByGroupId);
router.post('/attend', authMiddleware, lecturesController.attendLecture);
router.get('/:lectureId/attendance', authMiddleware, lecturesController.getAttendanceByLecture);
router.get('/:lectureId/non-attendees', authMiddleware, lecturesController.getUsersNotAttendedLecture);
router.get('/:groupId/attended-lectures', authMiddleware, lecturesController.getUserAttendedLecturesInGroup);
router.get('/:groupId/non-attended-lectures', authMiddleware, lecturesController.getUserNotAttendedLecturesInGroup);
router.delete('/:lectureId', authMiddleware, lecturesController.deleteLecturesById);
router.post('/:lectureId/createtasks', authMiddleware, lecturesController.createTaskInLecture);
router.put('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.updateTaskInLecture);
router.get('/:lectureId/tasks/taskId', authMiddleware, lecturesController.getTaskById);










// // Attendance
// router.get('/get-lecture-attendees', authMiddleware, lecturesController.getLectureAttendees);
// router.get('/user/attendance', authMiddleware, lecturesController.getUserAttendance);

// // Get lecture by ID
// router.delete('/:id', authMiddleware, lecturesController.deleteLecturesById);
// //get Lecture WithTasks AndUsers
// // router.get('/:lectureId', authMiddleware, lecturesController.getLectureWithTasksAndUsers);

// //update and delet task
// router.delete('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.deleteTask);
// // Get Attendees for a Lecture
// router.get('/:lectureId/attendees', lecturesController.getLectureAttendees);

// // get lecture by groupId only(admi, user, active)
// router.get('/group/:groupId/lectures', authMiddleware, lecturesController.getLecturesForGroup);

// // Submit task
// router.post('/:lectureId/tasks/:taskId/submit', authMiddleware, lecturesController.submitTask);

// // score for task
// router.put('/evaluate/:lectureId/:taskId', authMiddleware, lecturesController.evaluateTask);
// router.get('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.getTaskById);
// router.get('/tasks/:taskId/submissions', authMiddleware, lecturesController.getUsersWhoSubmittedTask);
// router.get('/tasks/submitted', authMiddleware, lecturesController.getTasksSubmittedByUser);


module.exports = router;