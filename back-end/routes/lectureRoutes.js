const express = require('express');
const router = express.Router();
const Lectures = require('../models/lectures');
const lecturesController = require('../controllers/lecturesController.js');
const authMiddleware = require('../middleware/authenticate');

router.post('/', authMiddleware, lecturesController.createLectures);
router.get('/', authMiddleware, lecturesController.getAllLectures);
// Attendance
router.post('/attend', authMiddleware, lecturesController.attendLecture);
router.get('/get-lecture-attendees', authMiddleware, lecturesController.getLectureAttendees);
router.get('/user/attendance', authMiddleware, lecturesController.getUserAttendance);

// Get lecture by ID
router.get('/:id', authMiddleware, lecturesController.getLecturesById);
router.put('/:id', authMiddleware, lecturesController.updateLecturesById);
router.delete('/:id', authMiddleware, lecturesController.deleteLecturesById);
router.post('/:lectureId/createtasks', authMiddleware, lecturesController.createTask);
router.get('/:lectureId/tasks', authMiddleware, lecturesController.getTasksByLectureId);
//get Lecture WithTasks AndUsers
// router.get('/:lectureId', authMiddleware, lecturesController.getLectureWithTasksAndUsers);

//update and delet task
router.put('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.editTask);
router.delete('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.deleteTask);
// Get Attendees for a Lecture
router.get('/:lectureId/attendees', lecturesController.getLectureAttendees);

// get lecture by groupId only(admi, user, active)
router.get('/group/:groupId/lectures', authMiddleware, lecturesController.getLecturesForGroup);

// Submit task
router.post('/:lectureId/tasks/:taskId/submit', authMiddleware, lecturesController.submitTask);

// score for task
router.put('/evaluate/:lectureId/:taskId', authMiddleware, lecturesController.evaluateTask);
router.get('/:lectureId/tasks/:taskId', authMiddleware, lecturesController.getTaskById);
router.get('/tasks/:taskId/submissions', authMiddleware, lecturesController.getUsersWhoSubmittedTask);
router.get('/tasks/submitted', authMiddleware, lecturesController.getTasksSubmittedByUser);

// cloudinary
// router.post('/uploadMediaAndUpdateLecture', upload.single('file'), lecturesController.uploadMediaAndUpdateLecture);
// router.delete('/delete-media-link', lecturesController.deleteMediaLink);


module.exports = router;