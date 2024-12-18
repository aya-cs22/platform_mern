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
router.put('/:lectureId/edit-task/:taskId', authMiddleware, lecturesController.updateTaskInLecture);
router.get('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.getTaskById);
router.get('/:lectureId/get-tasks', authMiddleware, lecturesController.getAllTasksByLectureId);
router.post('/:lectureId/submit-task/:taskId', authMiddleware, lecturesController.submitTask);
router.put('/:lectureId/tasks/:taskId/submissions/:submissionId/evaluate', authMiddleware, lecturesController.evaluateTask);
router.get('/:lectureId/:taskId/all-user-submit-task', authMiddleware, lecturesController.getAllUserSubmissionsForTask);
router.get('/:lectureId/:taskId/all-user-not-submit-task', authMiddleware, lecturesController.getUsersNotSubmittedTask);
router.get('/:groupId/get-user-submissions-for-group', authMiddleware, lecturesController.getUserSubmissionsForGroup);
router.get('/:groupId/get-user-unsubmissions-for-group', authMiddleware, lecturesController.getUserUnsubmittedTasksForGroup);
router.delete('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.deleteTask);




module.exports = router;