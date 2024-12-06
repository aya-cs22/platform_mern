// const cron = require('node-cron');
// const mongoose = require('mongoose');
// const Groups = require('../models/groups')
// const JoinRequests = require('../models/JoinRequests')
// const UserGroup = require('../models/userGroups')
// const User = require('../models/users');
// const moment = require('moment');


// // Job to check for expired users every minute

// // Job to check for expired users every minute
// cron.schedule('* * * * *', async () => { // Runs every minute
//     try {
//         // Get all user group records with active status
//         const userGroups = await UserGroup.find({ status: 'active' });

//         userGroups.forEach(async (userGroupRecord) => {
//             const user = await User.findById(userGroupRecord.user_id);
//             const group = await Groups.findById(userGroupRecord.group_id);

//             if (!user || !group) return;

//             // If the user has an end date and it's passed
//             if (userGroupRecord.endDate && moment(userGroupRecord.endDate).isBefore(moment())) {
//                 // Remove user from group members
//                 group.members = group.members.filter(member => member.user_id.toString() !== user._id.toString());
//                 await group.save();

//                 // Remove group from user's groups
//                 user.groupId = user.groupId.filter(groupItem => groupItem.group_id.toString() !== group._id.toString());
//                 await user.save();

//                 // Remove user group record
//                 await userGroupRecord.remove();
//                 console.log(`User ${user.name} removed from group ${group.title}`);
//             }
//         });
//     } catch (error) {
//         console.error('Error in cron job:', error);
//     }
// });