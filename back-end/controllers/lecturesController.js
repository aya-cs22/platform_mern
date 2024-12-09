const Lectures = require('../models/lectures');
const UserGroup = require('../models/userGroups');
const Groups = require('../models/groups');
const JoinRequests = require('../models/JoinRequests');

const qrCode = require('qrcode');
const { Admin } = require('mongodb');
const User = require('../models/users');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// require('dotenv').config();
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// Creat Lecture

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.createLectures = async (req, res) => {
  try {
    const { group_id, description, title, article, resources } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const generateUniqueCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const qr_code = generateUniqueCode();

    const lecture = new Lectures({
      group_id,
      title,
      article,
      description,
      resources,
      qr_code,
    });
    await lecture.save();

    const group = await Groups.findById(group_id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const usersInGroup = await UserGroup.find({ group_id });
    const userIds = usersInGroup.map((userGroup) => userGroup.user_id);

    const users = await User.find({ '_id': { $in: userIds } });
    const emailAddresses = users.map(user => user.email);

    emailAddresses.forEach(async (email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `New Lecture Created: ${title}`,
        text: `Dear User,\n\nA new lecture titled "${title}" has been created in your group. You can now access the lecture and its resources.\n\nBest regards,\nYour Platform`,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error(`Failed to send email to ${email}: `, error);
      }
    });

    res.status(201).json({ message: 'Lecture created successfully', lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// upload Media And Update Lecture
// exports.uploadMediaAndUpdateLecture = async (req, res) => {
//   try {
//     const file = req.file;
//     const { lectureId } = req.body;

//     if (!file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
//     const uploadResponse = await cloudinary.uploader.upload(file.path);
//     const public_id = uploadResponse.public_id;
//     const url = uploadResponse.secure_url;
//     const lecture = await Lectures.findById(lectureId);
//     if (!lecture) {
//       return res.status(404).json({ message: 'Lecture not found' });
//     }
//     lecture.mediaLinks.push({
//       url,
//       public_id
//     });

//     await lecture.save();

//     res.status(200).json({
//       message: 'File uploaded and lecture updated successfully',
//       url,
//       public_id,
//       lecture
//     });
//   } catch (error) {
//     console.error('Error uploading media:', error);
//     res.status(500).json({ message: 'Error uploading media', error });
//   }
// };

// exports.deleteMediaLink = async (req, res) => {
//   try {
//     const { lectureId, public_id } = req.body;

//     const lecture = await Lectures.findById(lectureId);
//     if (!lecture) {
//       return res.status(404).json({ message: 'Lecture not found' });
//     }
//     const mediaIndex = lecture.mediaLinks.findIndex(media => media.public_id === public_id);
//     if (mediaIndex === -1) {
//       return res.status(404).json({ message: 'Media link not found' });
//     }
//     lecture.mediaLinks.splice(mediaIndex, 1);

//     await cloudinary.uploader.destroy(public_id);
//     await lecture.save();

//     res.status(200).json({ message: 'Media link deleted successfully', lecture });
//   } catch (error) {
//     console.error('Error deleting media link:', error);
//     res.status(500).json({ message: 'Error deleting media link', error });
//   }
// };


// attend user
exports.attendLecture = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lectureId, qr_code } = req.body;

    if (!lectureId || !qr_code) {
      return res.status(400).json({ error: 'Lecture ID and code are required.' });
    }
    const lecture = await Lectures.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found.' });
    }

    if (lecture.qr_code !== qr_code) {
      return res.status(400).json({ error: 'Invalid code.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const existingAttendance = lecture.attendees.find(att => att.userId.toString() === userId);
    if (existingAttendance) {
      return res.status(400).json({ error: 'You have already registered for this lecture.' });
    }
    lecture.attendees.push({
      userId: userId,
      attendedAt: new Date()
    });
    lecture.attendanceCount += 1;
    await lecture.save();
    user.attendance.push({
      lectureId: lectureId,
      attended: true,
      attendedAt: new Date()
    });
    await user.save();
    res.status(200).json({ message: 'Successfully attended the lecture.' });
  } catch (error) {
    console.error('Error in attendLecture:', error);
    res.status(500).json({ error: 'An error occurred while attending the lecture.' });
  }
};


// Get Attendees for a Lecture
exports.getLectureAttendees = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lectures.findById(lectureId).populate('attendees.userId', 'name email');


    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found.' });
    }

    if (lecture.attendees.length === 0) {
      return res.status(200).json({ message: 'No attendees for this lecture.' });
    }

    res.status(200).json({ attendees: lecture.attendees });
  } catch (error) {
    console.error('Error fetching lecture attendees:', error);
    res.status(500).json({ error: 'An error occurred while fetching lecture attendees.' });
  }
};


exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('attendance.lectureId', 'title description date');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const attendedLectures = user.attendance.map(att => ({
      lectureId: att.lectureId._id,
      title: att.lectureId.title,
      description: att.lectureId.description,
      date: att.lectureId.date,
      attendedAt: att.attendedAt,
    }));

    res.status(200).json({ attendedLectures });
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    res.status(500).json({ error: 'An error occurred while fetching user attendance.' });
  }
};


// get all lecture 
exports.getAllLectures = async (req, res) => {
  try {
    const lecture = await Lectures.find();
    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLecturesById = async (req, res) => {
  try {
    const lecture = await Lectures.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id);

    if (req.user.role === 'admin') {
      return res.status(200).json(lecture);
    }

    const group = await Groups.findById(lecture.group_id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found for the lecture' });
    }

    const joinRequest = await JoinRequests.findOne({
      user_id: req.user.id,
      group_id: group._id,
    });

    console.log('Join Request:', joinRequest);

    if (!joinRequest || joinRequest.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied: You must be approved or an admin to access this lecture' });
    }

    return res.status(200).json(lecture);
  } catch (error) {
    console.error('Error fetching lecture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update lecture by id
exports.updateLecturesById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, article, resources, mediaLinks, qr_code } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateLecturesData = {
      title,
      description,
      article,
      resources,
      mediaLinks,
      qr_code,
      updated_at: Date.now(),
    };

    const updateLecture = await Lectures.findByIdAndUpdate(id, updateLecturesData, { new: true, runValidators: true });
    if (!updateLecture) {
      return res.status(400).json({ message: 'Lectures not found' });
    }

    res.status(200).json(updateLecture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// delet lecture by id
exports.deleteLecturesById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const deletedLecture = await Lectures.findByIdAndDelete(id);
    if (!deletedLecture) {
      return res.status(404).json({ message: 'courses not found' });
    }
    res.status(200).json({ message: 'lecture delet successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

// creat task by admin
exports.createTask = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { taskLink, description_task, start_date, end_date } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acess denied' });
    }
    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    lecture.tasks.push({
      taskLink,
      description_task,
      start_date,
      end_date
    });
    await lecture.save();
    res.status(201).json({ message: 'Task added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// edit task by taskId
exports.editTask = async (req, res) => {
  try {
    const { lectureId, taskId } = req.params;
    const { taskLink, description_task, start_date, end_date } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const task = lecture.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.taskLink = taskLink || task.taskLink;
    task.description_task = description_task || task.description_task;
    task.start_date = start_date || task.start_date;
    task.end_date = end_date || task.end_date;

    await lecture.save();
    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// delet task by taskId
exports.deleteTask = async (req, res) => {
  try {
    const { lectureId, taskId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const taskIndex = lecture.tasks.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    lecture.tasks.splice(taskIndex, 1);

    await lecture.save();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks by lecture id
exports.getTasksByLectureId = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lectures.findById(lectureId).populate('tasks');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.status(200).json({ tasks: lecture.tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Submit a Task
exports.submitTask = async (req, res) => {
  try {
    const { submissionLink } = req.body;
    const { lectureId, taskId } = req.params;
    const userId = req.user.id;

    if (!submissionLink) {
      return res.status(400).json({ error: 'Submission link is required' });
    }

    const lecture = await Lectures.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const task = lecture.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const currentDate = new Date();
    const endDate = new Date(task.end_date);
    if (currentDate > endDate) {
      return res.status(403).json({ error: 'Submission deadline has passed' });
    }

    const alreadySubmitted = lecture.submittedBy.some(
      (submission) => submission.userId.toString() === userId
    );

    task.submissions.push({
      userId,
      submissionLink,
      submittedAt: currentDate,
      submittedOnTime: true,
    });

    if (!alreadySubmitted) {
      lecture.submittedBy.push({
        userId,
        submittedAt: currentDate,
      });
    }

    await lecture.save();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const taskSubmission = {
      lectureId,
      taskId,
      submissionLink,
      submittedOnTime: true,
      submittedAt: currentDate,
      score: null,
    };

    user.tasks.push(taskSubmission);
    await user.save();

    const users = await User.find({
      _id: { $in: lecture.submittedBy.map((sub) => sub.userId) },
    });

    res.status(200).json({
      message: 'Task submitted successfully',
      task,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    console.error('Error in submitTask:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Evaluate a Task by Admin
exports.evaluateTask = async (req, res) => {
  try {
    const { lectureId, taskId } = req.params;
    const { userId, score } = req.body;

    console.log(`Evaluating task. Lecture ID: ${lectureId}, Task ID: ${taskId}, User ID: ${userId}, Score: ${score}`);
    const updatedLecture = await Lectures.findOneAndUpdate(
      {
        _id: lectureId,
        'tasks._id': taskId,
        'tasks.submissions.userId': userId,
      },
      {
        $set: {
          'tasks.$[task].submissions.$[submission].score': score,
        },
      },
      {
        arrayFilters: [{ 'task._id': taskId }, { 'submission.userId': userId }],
        new: true,
      }
    );

    if (!updatedLecture) {
      console.log(`Lecture or task not found with ID: ${lectureId}`);
      return res.status(404).json({ message: 'Lecture or task not found' });
    }
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        'tasks.taskId': taskId,
        'tasks.lectureId': lectureId,
      },
      {
        $set: {
          'tasks.$.score': score,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`User not found or task not found for User ID: ${userId}`);
      return res.status(404).json({ message: 'User or task not found' });
    }

    console.log(`Updated score for User ID: ${userId}: ${score}`);

    return res.status(200).json({ message: 'Task evaluated successfully', score });
  } catch (error) {
    console.error('Error in evaluateTask:', error);
    return res.status(500).json({ message: 'An error occurred while evaluating the task' });
  }
};


// Display all information related to the lecture and user
// exports.getLectureWithTasksAndUsers = async (req, res) => {
//   try {
//     const { lectureId } = req.params;
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Aess denied' });
//     }
//     const lecture = await Lectures.findById(lectureId)
//       .populate('submittedBy', 'name email')
//       .populate('attendees', 'name email');

//     if (!lecture) {
//       return res.status(404).json({ error: 'Lecture not found' });
//     }

//     res.status(200).json({
//       title: lecture.title,
//       description: lecture.description,
//       tasks: lecture.tasks.map(task => ({
//         id: task._id,
//         taskLink: task.taskLink,
//         description: task.description_task,
//         start_date: task.start_date,
//         end_date: task.end_date,
//         submissionLink: task.submissionLink
//       })),
//       submittedBy: lecture.submittedBy,
//       attendees: lecture.attendees,
//       attendanceCount: lecture.attendanceCount
//     });

//   } catch (error) {
//     console.error('Error fetching lecture data:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



exports.getLecturesForGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    console.log('User ID:', userId);
    console.log('Group ID:', groupId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      const lectures = await Lectures.find({ group_id: groupId });
      console.log('Lectures for admin:', lectures);
      return res.status(200).json({
        message: 'Lectures for group retrieved successfully',
        lectures
      });
    }

    const userGroup = await UserGroup.findOne({ user_id: userId, group_id: groupId, status: 'active' });
    if (!userGroup) {
      return res.status(403).json({ message: 'You are not an active member of this group' });
    }

    const lectures = await Lectures.find({ group_id: groupId });
    console.log('Lectures for active member:', lectures);
    return res.status(200).json({
      message: 'Lectures for group retrieved successfully',
      lectures
    });

  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get all user submit task
exports.getUsersWhoSubmittedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lecture = await Lectures.findOne({ 'tasks._id': taskId });
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture or task not found' });
    }

    const task = lecture.tasks.find((task) => task._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const userIds = task.submissions.map((submission) => submission.userId);

    const users = await User.find({ _id: { $in: userIds } });

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    console.error('Error in getUsersWhoSubmittedTask:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get task by taskid
exports.getTaskById = async (req, res) => {
  try {
    const { lectureId, taskId } = req.params;

    const lecture = await Lectures.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const task = lecture.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Get all tasks submitted by a specific user
exports.getTasksSubmittedByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const lectures = await Lectures.find({ 'tasks.submissions.userId': userId });

    if (!lectures || lectures.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    const tasksSubmittedByUser = lectures.flatMap((lecture) =>
      lecture.tasks.filter((task) =>
        task.submissions.some((submission) => submission.userId.toString() === userId)
      )
    );

    res.status(200).json({
      userId,
      tasks: tasksSubmittedByUser.map((task) => ({
        taskId: task._id,
        description: task.description_task,
        submissions: task.submissions.filter(
          (submission) => submission.userId.toString() === userId
        ),
      })),
    });
  } catch (error) {
    console.error('Error in getTasksSubmittedByUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
