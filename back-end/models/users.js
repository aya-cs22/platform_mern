const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const xss = require('xss');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: [10, 'too short password']
  },

  isVerified: {
    type: Boolean,
    default: false // user need to virify your email
  },

  phone_number: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: function () {
      return this.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    }
  },

  googleLogin: {
    type: Boolean,
    default: false,
  },

  groups: [
    {
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
    },
  ],

  feedback: { type: String, default: '' },

  emailVerificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpiry: { // Verification code expiration date
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpiry: {
    type: Date,
    default: null
  },

  attendance: [
    {
      lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lectures',
        required: true
      },
      attendanceStatus: {
        type: String,
        enum: ['present', 'absent'],
        default: 'absent',
      },
      attendedAt: {
        type: Date,
        default: null
      }
    }
  ],

  totalPresent: {
    type: Number,
    default: 0
  },
  totalAbsent: {
    type: Number,
    default: 0
  },
  tasks: [
    {
      lectureId: mongoose.Schema.Types.ObjectId,
      taskId: mongoose.Schema.Types.ObjectId,
      submissionLink: String,
      submittedOnTime: Boolean,
      submittedAt: Date,
      score: Number,
      feedback: String,
    },
  ],


  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },

});

// Before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Encrypt the password before saving
  this.password = await bcrypt.hash(this.password, 10);
  this.updated_at = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;