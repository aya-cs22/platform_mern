const Lectures = require('../models/lectures');
const Groups = require('../models/groups');

const User = require('../models/users');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const transporter = require('../config/mailConfig');

// Create Lecture
exports.createLectures = async (req, res) => {
  try {
    const { group_id, description, title, article, resources } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate unique 6-character code
    const generateUniqueCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };
    const code = generateUniqueCode();

    const lecture = new Lectures({
      group_id,
      title,
      article,
      description,
      resources,
      code,
    });

    await lecture.save();

    const group = await Groups.findById(group_id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const users = await User.find({ 'groups.groupId': group_id });

    const approvedUsers = users.filter(user =>
      user.groups.some(group => group.groupId.toString() === group_id && group.status === 'approved')
    );

    const emailAddresses = approvedUsers.map(user => user.email);

    if (emailAddresses.length === 0) {
      console.log('No approved users to notify');
    } else {
      emailAddresses.forEach(async (email) => {
        const mailOptions = {
          from: process.env.ADMIN_EMAIL,
          to: email,
          subject: `New Lecture Created: ${title}`,
          text: `Dear User,\n\nA new lecture titled "${title}" has been created in your group. You can now access the lecture and its resources.\n\nBest regards,\nYour Platform`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${email}`);
        } catch (error) {
          console.error(`Failed to send email to ${email}: `, error);
        }
      });
    }

    res.status(201).json({ message: 'Lecture created successfully', lecture });
  } catch (error) {
    console.error('Error creating lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Update Lecture
exports.updateLecturesById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description, article, resources } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    lecture.title = title || lecture.title;
    lecture.description = description || lecture.description;
    lecture.article = article || lecture.article;
    lecture.resources = resources || lecture.resources;

    await lecture.save();

    return res.status(200).json({ message: 'Lecture updated successfully', lecture });
  } catch (error) {
    console.error('Error updating lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// Get Lecture by ID
exports.getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    if (req.user.role === 'admin') {
      const lecture = await Lectures.findById(lectureId).populate('group_id');
      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found' });
      }
      return res.status(200).json({ lecture });
    }

    const lecture = await Lectures.findById(lectureId).populate('group_id');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const user = req.user;
    const userGroup = user.groups.find(group => group.groupId.toString() === lecture.group_id._id.toString());

    if (!userGroup || userGroup.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied, user not approved in the group' });
    }

    return res.status(200).json({ lecture });
  } catch (error) {
    console.error('Error getting lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Get Lectures by group_id

exports.getLecturesByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (req.user.role === 'admin') {
      const lectures = await Lectures.find({ group_id: groupId }).populate('group_id');
      if (!lectures || lectures.length === 0) {
        return res.status(404).json({ message: 'No lectures found for this group' });
      }
      return res.status(200).json({ lectures });
    }

    const user = req.user;
    const approvedGroup = user.groups.find(group => group.groupId.toString() === groupId && group.status === 'approved');

    if (!approvedGroup) {
      return res.status(403).json({ message: 'Access denied, user not approved in this group' });
    }

    const lectures = await Lectures.find({ group_id: groupId }).populate('group_id');
    if (!lectures || lectures.length === 0) {
      return res.status(404).json({ message: 'No lectures found for this group' });
    }

    return res.status(200).json({ lectures });
  } catch (error) {
    console.error('Error getting lectures by group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// attend user
exports.attendLecture = async (req, res) => {
  try {
    const { lectureId, code } = req.body; // الحصول على lectureId والكود من الـ body
    const userId = req.user.id; // الحصول على id المستخدم الحالي من الـ JWT

    // التحقق من صحة الكود
    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // تحقق من الكود المدخل
    if (lecture.code !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    // تحقق إذا كان المستخدم معتمد في الجروب
    const group = await Groups.findById(lecture.group_id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isApproved = user.groups.some(group => group.groupId.toString() === lecture.group_id.toString() && group.status === 'approved');
    if (!isApproved) {
      return res.status(403).json({ message: 'User is not approved in this group' });
    }

    // تحقق من أنه لم يتم تسجيل الحضور للمستخدم بالفعل في هذه المحاضرة
    const alreadyAttended = user.attendance.some(att => att.lectureId.toString() === lectureId);
    if (alreadyAttended) {
      return res.status(400).json({ message: 'User already attended this lecture' });
    }

    // إضافة الحضور للمحاضرة
    lecture.attendees.push({ userId });
    lecture.attendanceCount += 1;

    // تحديث حالة الحضور للمستخدم في قائمة الحضور
    user.attendance.push({
      lectureId,
      attendanceStatus: 'present',  // تحديد أن المستخدم حضر المحاضرة
      attendedAt: Date.now(),
    });

    // تحديث عد الحضور الكلي للمستخدم
    user.totalPresent += 1;

    // حفظ المحاضرة والمستخدم مع التحديثات
    await lecture.save();
    await user.save();

    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Error attending lecture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all users' attendance for a specific lecture (Admin only)
exports.getAttendanceByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    const lecture = await Lectures.findById(lectureId).populate('attendees.userId', 'name email');  // Populate user details like name and email

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const attendance = lecture.attendees.map(attendee => ({
      userId: attendee.userId,
      attendanceStatus: attendee.attendanceStatus,
      attendedAt: attendee.attendedAt
    }));

    if (attendance.length === 0) {
      return res.status(404).json({ message: 'No attendees found for this lecture' });
    }

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





// Get all users who did NOT attend a specific lecture (Admin only)
exports.getUsersNotAttendedLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    const lecture = await Lectures.findById(lectureId).populate('attendees.userId', 'name email');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // اجلب المجموعة المرتبطة بالمحاضرة
    const group = await Groups.findById(lecture.group_id).populate('members.user_id', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // تأكد من أن أعضاء المجموعة موجودين
    if (!Array.isArray(group.members)) {
      return res.status(500).json({ message: 'Group members are not defined properly' });
    }

    // استخراج IDs الأعضاء الحاضرين
    const attendeesIds = lecture.attendees.map((attendee) => attendee.userId._id.toString());

    // استخراج أعضاء المجموعة الذين لم يحضروا
    const usersNotAttended = group.members.filter(
      (member) => !attendeesIds.includes(member.user_id._id.toString())
    );

    if (usersNotAttended.length === 0) {
      return res.status(404).json({ message: 'All users attended the lecture' });
    }

    return res.status(200).json({ usersNotAttended });
  } catch (error) {
    console.error('Error fetching non-attendees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





exports.getUserAttendedLecturesInGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const lectures = await Lectures.find({ group_id: groupId })
      .populate('attendees.userId', 'name email')
      .select('title attendees');

    if (!lectures || lectures.length === 0) {
      return res.status(404).json({ message: 'No lectures found for this group' });
    }

    const attendedLectures = lectures.filter((lecture) =>
      lecture.attendees.some((attendee) => attendee.userId._id.toString() === userId)
    );

    if (attendedLectures.length === 0) {
      return res.status(404).json({ message: 'User has not attended any lectures in this group' });
    }

    const response = attendedLectures.map((lecture) => ({
      title: lecture.title,
      attendedAt: lecture.attendees.find(
        (attendee) => attendee.userId._id.toString() === userId
      )?.attendedAt,
    }));

    res.status(200).json({ attendedLectures: response });
  } catch (error) {
    console.error('Error fetching attended lectures:', error);
    res.status(500).json({ message: 'Server error' });
  }
};







exports.getUserNotAttendedLecturesInGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const lectures = await Lectures.find({ group_id: groupId })
      .populate('attendees.userId', 'name email')
      .select('title attendees');

    if (!lectures || lectures.length === 0) {
      return res.status(404).json({ message: 'No lectures found for this group' });
    }

    const notAttendedLectures = lectures.filter((lecture) =>
      !lecture.attendees.some((attendee) => attendee.userId._id.toString() === userId)
    );

    if (notAttendedLectures.length === 0) {
      return res.status(404).json({ message: 'User has attended all lectures in this group' });
    }

    const response = notAttendedLectures.map((lecture) => ({
      title: lecture.title,
      scheduledAt: lecture.created_at,
    }));

    res.status(200).json({ notAttendedLectures: response });
  } catch (error) {
    console.error('Error fetching non-attended lectures:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// delet lecture by id
exports.deleteLecturesById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deletedLecture = await Lectures.findByIdAndDelete(lectureId);
    if (!deletedLecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    await User.updateMany(
      { 'attendance.lectureId': lectureId },
      { $pull: { attendance: { lectureId } } }
    );

    res.status(200).json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};





// creat task by admin
exports.createTaskInLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { description_task, end_date } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const newTask = {
      description_task,
      end_date,
    };

    lecture.tasks.push(newTask);
    lecture.updated_at = Date.now();
    await lecture.save();

    return res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




// update Task In Lecture
exports.updateTaskInLecture = async (req, res) => {
  try {
    const { lectureId, taskId } = req.params;
    const { description_task, end_date } = req.body;

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

    if (description_task) task.description_task = description_task;
    if (end_date) task.end_date = end_date;

    lecture.updated_at = Date.now();

    await lecture.save();

    return res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// // delet task by taskId
// exports.deleteTask = async (req, res) => {
//   try {
//     const { lectureId, taskId } = req.params;

//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const lecture = await Lectures.findById(lectureId);
//     if (!lecture) {
//       return res.status(404).json({ message: 'Lecture not found' });
//     }

//     const taskIndex = lecture.tasks.findIndex(task => task._id.toString() === taskId);
//     if (taskIndex === -1) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     lecture.tasks.splice(taskIndex, 1);

//     await lecture.save();

//     res.status(200).json({ message: 'Task deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// Get Task by ID inside a lecture
exports.getTaskById = async (req, res) => {
  try {
    const { lectureId, taskId } = req.params;

    // Case for admin
    if (req.user.role === 'admin') {
      const lecture = await Lectures.findById(lectureId).populate('group_id');
      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found' });
      }

      const task = lecture.tasks.id(taskId); // Find task by taskId inside the lecture
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.status(200).json({ task });
    }

    // Case for non-admin user
    const lecture = await Lectures.findById(lectureId).populate('group_id');
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const user = req.user;
    const userGroup = user.groups.find(group => group.groupId.toString() === lecture.group_id._id.toString());

    if (!userGroup) {
      return res.status(403).json({ message: 'Access denied, user not in the group' });
    }

    // Check if the user has an approved status in the group
    if (userGroup.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied, user not approved in the group' });
    }

    const task = lecture.tasks.id(taskId); // Find task by taskId inside the lecture
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




































// // Get all tasks by lecture id
// exports.getTasksByLectureId = async (req, res) => {
//   try {
//     const { lectureId } = req.params;

//     const lecture = await Lectures.findById(lectureId).populate('tasks');

//     if (!lecture) {
//       return res.status(404).json({ message: 'Lecture not found' });
//     }

//     res.status(200).json({ tasks: lecture.tasks });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // Submit a Task
// exports.submitTask = async (req, res) => {
//   try {
//     const { submissionLink } = req.body;
//     const { lectureId, taskId } = req.params;
//     const userId = req.user.id;

//     if (!submissionLink) {
//       return res.status(400).json({ error: 'Submission link is required' });
//     }

//     const lecture = await Lectures.findById(lectureId);

//     if (!lecture) {
//       return res.status(404).json({ error: 'Lecture not found' });
//     }

//     const task = lecture.tasks.id(taskId);

//     if (!task) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     const currentDate = new Date();
//     const endDate = new Date(task.end_date);
//     if (currentDate > endDate) {
//       return res.status(403).json({ error: 'Submission deadline has passed' });
//     }

//     const alreadySubmitted = lecture.submittedBy.some(
//       (submission) => submission.userId.toString() === userId
//     );

//     task.submissions.push({
//       userId,
//       submissionLink,
//       submittedAt: currentDate,
//       submittedOnTime: true,
//     });

//     if (!alreadySubmitted) {
//       lecture.submittedBy.push({
//         userId,
//         submittedAt: currentDate,
//       });
//     }

//     await lecture.save();

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const taskSubmission = {
//       lectureId,
//       taskId,
//       submissionLink,
//       submittedOnTime: true,
//       submittedAt: currentDate,
//       score: null,
//     };

//     user.tasks.push(taskSubmission);
//     await user.save();

//     const users = await User.find({
//       _id: { $in: lecture.submittedBy.map((sub) => sub.userId) },
//     });

//     res.status(200).json({
//       message: 'Task submitted successfully',
//       task,
//       users: users.map((user) => ({
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       })),
//     });
//   } catch (error) {
//     console.error('Error in submitTask:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



// // Evaluate a Task by Admin
// exports.evaluateTask = async (req, res) => {
//   try {
//     const { lectureId, taskId } = req.params;
//     const { userId, score } = req.body;

//     console.log(`Evaluating task. Lecture ID: ${lectureId}, Task ID: ${taskId}, User ID: ${userId}, Score: ${score}`);
//     const updatedLecture = await Lectures.findOneAndUpdate(
//       {
//         _id: lectureId,
//         'tasks._id': taskId,
//         'tasks.submissions.userId': userId,
//       },
//       {
//         $set: {
//           'tasks.$[task].submissions.$[submission].score': score,
//         },
//       },
//       {
//         arrayFilters: [{ 'task._id': taskId }, { 'submission.userId': userId }],
//         new: true,
//       }
//     );

//     if (!updatedLecture) {
//       console.log(`Lecture or task not found with ID: ${lectureId}`);
//       return res.status(404).json({ message: 'Lecture or task not found' });
//     }
//     const updatedUser = await User.findOneAndUpdate(
//       {
//         _id: userId,
//         'tasks.taskId': taskId,
//         'tasks.lectureId': lectureId,
//       },
//       {
//         $set: {
//           'tasks.$.score': score,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       console.log(`User not found or task not found for User ID: ${userId}`);
//       return res.status(404).json({ message: 'User or task not found' });
//     }

//     console.log(`Updated score for User ID: ${userId}: ${score}`);

//     return res.status(200).json({ message: 'Task evaluated successfully', score });
//   } catch (error) {
//     console.error('Error in evaluateTask:', error);
//     return res.status(500).json({ message: 'An error occurred while evaluating the task' });
//   }
// };




// exports.getLecturesForGroup = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const groupId = req.params.groupId;

//     console.log('User ID:', userId);
//     console.log('Group ID:', groupId);

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.role === 'admin') {
//       const lectures = await Lectures.find({ group_id: groupId });
//       console.log('Lectures for admin:', lectures);
//       return res.status(200).json({
//         message: 'Lectures for group retrieved successfully',
//         lectures
//       });
//     }

//     const userGroup = await UserGroup.findOne({ user_id: userId, group_id: groupId, status: 'active' });
//     if (!userGroup) {
//       return res.status(403).json({ message: 'You are not an active member of this group' });
//     }

//     const lectures = await Lectures.find({ group_id: groupId });
//     console.log('Lectures for active member:', lectures);
//     return res.status(200).json({
//       message: 'Lectures for group retrieved successfully',
//       lectures
//     });

//   } catch (error) {
//     console.error('Error fetching lectures:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // get all user submit task
// exports.getUsersWhoSubmittedTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;

//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const lecture = await Lectures.findOne({ 'tasks._id': taskId });
//     if (!lecture) {
//       return res.status(404).json({ message: 'Lecture or task not found' });
//     }

//     const task = lecture.tasks.find((task) => task._id.toString() === taskId);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     const userIds = task.submissions.map((submission) => submission.userId);

//     const users = await User.find({ _id: { $in: userIds } });

//     res.status(200).json({
//       users: users.map((user) => ({
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       })),
//     });
//   } catch (error) {
//     console.error('Error in getUsersWhoSubmittedTask:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // Get task by taskid
// exports.getTaskById = async (req, res) => {
//   try {
//     const { lectureId, taskId } = req.params;

//     const lecture = await Lectures.findById(lectureId);

//     if (!lecture) {
//       return res.status(404).json({ message: 'Lecture not found' });
//     }

//     const task = lecture.tasks.id(taskId);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     res.status(200).json({ task });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// // Get all tasks submitted by a specific user
// exports.getTasksSubmittedByUser = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const lectures = await Lectures.find({ 'tasks.submissions.userId': userId });

//     if (!lectures || lectures.length === 0) {
//       return res.status(404).json({ message: 'No tasks found for this user' });
//     }

//     const tasksSubmittedByUser = lectures.flatMap((lecture) =>
//       lecture.tasks.filter((task) =>
//         task.submissions.some((submission) => submission.userId.toString() === userId)
//       )
//     );

//     res.status(200).json({
//       userId,
//       tasks: tasksSubmittedByUser.map((task) => ({
//         taskId: task._id,
//         description: task.description_task,
//         submissions: task.submissions.filter(
//           (submission) => submission.userId.toString() === userId
//         ),
//       })),
//     });
//   } catch (error) {
//     console.error('Error in getTasksSubmittedByUser:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };