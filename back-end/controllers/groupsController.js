const Groups = require('../models/groups');
const moment = require('moment');
const { use } = require('../config/mailConfig');
const mongoose = require('mongoose');
const User = require('../models/users');
const Lectures = require('../models/lectures');
// creat group by admin
exports.creatGroups = async (req, res) => {
    try {
        const { title, type_course, location, start_date, end_date } = req.body;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acess denied' });
        }
        const groups = new Groups({

            title,
            type_course, location,
            location,
            start_date,
            end_date
        });
        await groups.save();
        res.status(201).json(groups);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'server error' });
    }
};

// get all groups
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Groups.find().populate('type_course');
        res.status(200).json(groups)
    } catch (error) {
        res.status(500).json({ message: 'server error', error: error.message });
    }
};



// // get groups by id
// exports.getGroupsById = async (req, res) => {
//     try {
//         const groups = await Groups.findById(req.params.id).populate('type_course');
//         if (!groups) {
//             return res.status(404).json({ message: 'groups not found' });
//         }
//         return res.status(200).json(groups);
//     } catch (error) {
//         console.error('Error  fetching group');
//         res.status(500).json({ message: 'server error' });
//     }
// };


exports.getGroupsById = async (req, res) => {
    try {
        const group = await Groups.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        console.log('User role:', req.user.role);
        console.log('User ID:', req.user.id);

        if (req.user.role === 'admin') {
            return res.status(200).json(group);
        }

        console.log('Join Request:', joinRequest);
        if (!joinRequest || joinRequest.status !== 'approved') {
            return res.status(403).json({ message: 'Access denied: You must be approved or an admin to access this group' });
        }
        return res.status(200).json(group);
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// update group by id
exports.updateGroupsById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type_course, location, start_date, end_date } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updateGroupsData = {
            title: title,
            type_course: type_course,
            location: location || "",
            start_date: start_date,
            end_date: end_date
        };

        const updatedGroup = await Groups.findByIdAndUpdate(id, updateGroupsData, { new: true, runValidators: true });

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(updatedGroup);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.sendGroupId = async (req, res) => {
    try {
        const { groupId } = req.body;

        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }

        const group = await Groups.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json({ message: 'Group found', groupId: group._id });
    } catch (error) {
        console.error('Error sending group ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.deleteGroupsById = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Lectures.deleteMany({ group_id: id });
        await User.updateMany(
            { 'groupId.group_id': id },
            { $pull: { groupId: { group_id: id } } }
        );

        const deleteGroups = await Groups.findByIdAndDelete(id);
        if (!deleteGroups) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Group and related data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
