
const transporter = require('../config/mailConfig');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Groups = require('../models/groups');
const Lectures = require('../models/lectures');






const EMAIL_VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes 

// Function to generate a 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone_number } = req.body;

        if (!password || password.length < 10) {
            return res.status(400).json({ message: 'Password must be at least 10 characters long' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        if (!phone_number) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Check if the user exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified' });
            } else {
                user.emailVerificationCode = generateVerificationCode();
                user.verificationCodeExpiry = new Date(Date.now() + EMAIL_VERIFICATION_TIMEOUT);
                await user.save();

                const mailOptions = {
                    from: process.env.ADMIN_EMAIL,
                    to: user.email,
                    subject: 'Email Verification Code from Code Eagles',
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                        <header style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px;">Welcome to Code Eagles!</h1>
                        </header>
                        <div style="padding: 20px;">
                            <h2 style="font-size: 20px; color: #333;">Hello, ${user.name}!</h2>
                            <p style="color: #555;">To complete your registration, please verify your email address using the code below:</p>
                            <div style="text-align: center; margin: 20px 0; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                                <p style="font-size: 1.5em; font-weight: bold; color: #4CAF50;">${user.emailVerificationCode}</p>
                            </div>
                            <p style="color: #555;">This code is valid for the next 10 minutes. If you didn’t request this email, please ignore it.</p>
                            <p style="margin-top: 20px; color: #555;">Happy Coding!<br>The Code Eagles Team</p>
                        </div>
                        <footer style="background-color: #f1f1f1; padding: 10px; text-align: center; color: #777; font-size: 14px;">
                            <p>© 2024 Code Eagles, All rights reserved.</p>
                        </footer>
                    </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                return res.status(200).json({ message: 'Verification code resent. Please verify your email.' });
            }
        }

        const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

        // Create a new user instance
        const newUser = new User({
            name,
            email,
            phone_number,
            password,
            isVerified: false,
            groupId: [],
            emailVerificationCode: generateVerificationCode(),
            verificationCodeExpiry: new Date(Date.now() + EMAIL_VERIFICATION_TIMEOUT)
        });

        await newUser.save();

        // Send verification email
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: newUser.email,
            subject: 'Email Verification Code from Code Eagles',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <header style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">Welcome to Code Eagles!</h1>
                </header>
                <div style="padding: 20px;">
                    <h2 style="font-size: 20px; color: #333;">Hello, ${newUser.name}!</h2>
                    <p style="color: #555;">To complete your registration, please verify your email address using the code below:</p>
                    <div style="text-align: center; margin: 20px 0; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                        <p style="font-size: 1.5em; font-weight: bold; color: #4CAF50;">${newUser.emailVerificationCode}</p>
                    </div>
                    <p style="color: #555;">This code is valid for the next 10 minutes. If you didn’t request this email, please ignore it.</p>
                    <p style="margin-top: 20px; color: #555;">Happy Coding!<br>The Code Eagles Team</p>
                </div>
                <footer style="background-color: #f1f1f1; padding: 10px; text-align: center; color: #777; font-size: 14px;">
                    <p>© 2024 Code Eagles, All rights reserved.</p>
                </footer>
            </div>
            `
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Registration successful, please verify your email' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



//verify Email
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.emailVerificationCode || user.emailVerificationCode !== code || new Date() > user.verificationCodeExpiry) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.emailVerificationCode = null;
        user.verificationCodeExpiry = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Error verifying email: ', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// forget password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = resetCode;
        user.resetPasswordExpiry = Date.now() + 1800000; // 3 minutes
        await user.save();

        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: user.email,
            subject: 'Reset Password',
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <header style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Code Eagles Password Reset</h1>
        </header>
        <div style="padding: 20px;">
            <h2 style="font-size: 20px; color: #333;">Hello, ${user.name}!</h2>
            <p style="color: #555;">We received a request to reset your password. Use the code below to reset it:</p>
            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                <p style="font-size: 2em; font-weight: bold; color: #4CAF50;">${resetCode}</p>
            </div>
            <p style="color: #555;">This code is valid for the next <strong>3 minutes</strong>. If you did not request this reset, please ignore this email or contact support if you have any concerns.</p>
            <p style="margin-top: 20px; color: #555;">Best Regards,<br>The Code Eagles Team</p>
        </div>
        <footer style="background-color: #f1f1f1; padding: 10px; text-align: center; color: #777; font-size: 14px;">
            <p>© 2024 Code Eagles, All rights reserved.</p>
            <p style="margin: 0;">Need help? Contact us at <a href="mailto:codeeagles653@gmail.com" style="color: #4CAF50; text-decoration: none;">support@codeeagles.com</a></p>
        </footer>
    </div>
    `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset password email sent' });
    } catch (error) {
        console.error('Error sending reset password email:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// update password
exports.resetPassword = async (req, res) => {
    try {
        const { resetCode, newPassword } = req.body;
        if (!newPassword || newPassword.length < 10) {
            return res.status(400).json({ message: 'New password must be at least 10 characters long' });
        }
        const user = await User.findOne({
            resetPasswordToken: resetCode,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// add user by admin
exports.addUser = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { name, email, password, phone_number, role, groupId } = req.body;

        if (!name || !email || !password || !phone_number || !role) {
            return res.status(400).json({ message: 'All fields except groupId are required' });
        }

        const exists_user = await User.findOne({ email });
        if (exists_user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let group;
        if (groupId) {
            group = await Groups.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }
        }

        await session.startTransaction();

        const newUser = new User({
            name,
            email,
            password,
            phone_number,
            role,
            isVerified: true,
            groups: group ? [{
                groupId: groupId,
                status: 'approved'
            }] : [],
        });

        await newUser.save({ session });

        if (group) {
            group.members.push({ user_id: newUser._id });
            await group.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error('Error adding user: ', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// get user by token
exports.getUserByhimself = async (req, res) => {
    try {
        const userIdFromToken = req.user.id;
        const user = await User.findById(userIdFromToken);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userResponse = { ...user._doc, password: undefined };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// get user by id
exports.getUserByid = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.id !== id && !(req.user.role === 'admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }


        let userResponse;

        if (req.user.role === 'admin') {
            userResponse = { ...user._doc, password: undefined };
        } else if (req.user.id === id) {
            userResponse = { ...user._doc };
        }

        res.status(200).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// get all user
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { name, email, password, role, phone_number } = req.body;
        const updates = {};

        const userIdFromToken = req.user.id;
        const userIdFromParams = req.params.id;

        if (!userIdFromParams || userIdFromToken === userIdFromParams) {
            if (name) updates.name = name;

            if (email) {
                const existingUser = await User.findOne({ email });
                if (existingUser && existingUser.id !== userIdFromToken) {
                    return res.status(400).json({ message: 'Email already exists' });
                } else {
                    updates.email = email;
                }
            }

            if (password) {
                if (password.length < 10) {
                    return res.status(400).json({ message: 'Password must be at least 10 characters' });
                }
                const salt = await bcrypt.genSalt(10);
                updates.password = await bcrypt.hash(password, salt);
            }

            if (phone_number) {
                const existingUserWithPhone = await User.findOne({ phone_number });
                if (existingUserWithPhone && existingUserWithPhone.id !== userIdFromToken) {
                    return res.status(400).json({ message: 'Phone number already exists' });
                } else {
                    updates.phone_number = phone_number;
                }
            }

        } else if (req.user.role === 'admin' && userIdFromParams) {
            if (role) updates.role = role;

        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findByIdAndUpdate(userIdFromParams || userIdFromToken, updates, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// delete user by admin and himself
exports.deleteUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const userIdFromToken = req.user.id;
        const userIdToDelete = id || userIdFromToken;

        if (req.user.role !== 'admin' && !id) {
            if (userIdFromToken !== userIdToDelete) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // العثور على المستخدم
        const user = await User.findById(userIdToDelete).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'User not found' });
        }

        await Groups.updateMany(
            { "members.user_id": userIdToDelete },
            { $pull: { members: { user_id: userIdToDelete } } },
            { session }
        );

        await Lectures.updateMany(
            { "tasks.submissions.userId": userIdToDelete },
            { $pull: { "tasks.$[].submissions": { userId: userIdToDelete } } },
            { session }
        );

        await Lectures.updateMany(
            { "attendees.userId": userIdToDelete },
            { $pull: { attendees: { userId: userIdToDelete } } },
            { session }
        );

        await User.findByIdAndDelete(userIdToDelete).session(session);

        await session.commitTransaction();

        return res.status(200).json({ message: 'User successfully deleted and removed from all groups, lectures, and submissions' });

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};






//the user send your feadback
exports.submitFeedback = async (req, res) => {
    const { name, email, feedback } = req.body;

    if (!name || !email || !feedback) {
        return res.status(400).json({ message: 'Name, Email, and Feedback are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.feedback = { name, feedback };
        await user.save();

        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// read all feadback
exports.getAllFeedback = async (req, res) => {
    try {
        const users = await User.find({ feedback: { $exists: true } });
        if (users.length === 0) {
            return res.status(404).json({ message: 'No feedback found' });
        }

        // const feedbacks = users.map(user => ({
        //     email: user.email,
        //     feedbacks: user.feedback.map(item => ({
        //         name: item.name,
        //         feedback: item.feedback
        //     }))
        // }));
        const feedbacks = users.map(user => ({
            email: user.email,
            name: user.feedback.name,
            feedback: user.feedback.feedback,
        }));

        res.status(200).json({ feedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// Get feadback by user ID
exports.getFeedbackById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.feedback || user.feedback.length === 0) {
            return res.status(404).json({ message: 'No feedback available for this user' });
        }

        const feedbacks = users.map(user => ({
            email: user.email,
            name: user.feedback.name,
            feedback: user.feedback.feedback,
        }));

        res.status(200).json({ email: user.email, feedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// update feadback by userId and feedbackId
exports.updateFeedback = async (req, res) => {
    const { userId, feedbackId } = req.params;
    const { name, feedback } = req.body;

    if (!name || !feedback) {
        return res.status(400).json({ message: 'Name and Feedback are required' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const feedbackIndex = user.feedback.findIndex(item => item._id.toString() === feedbackId);

        if (feedbackIndex === -1) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        user.feedback[feedbackIndex] = { name, feedback };

        await user.save();

        res.status(200).json({ message: 'Feedback updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};