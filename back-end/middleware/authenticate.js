const jwt = require('jsonwebtoken');
const User = require('../models/users');
const mongoose = require('mongoose'); // لاستعمال ObjectId

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // التحقق من التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // تعديل حسب نموذج الـ User لديك

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // التحقق من الـ role و المجموعات
    req.user = {
      id: user._id,
      role: user.role,
      groups: user.groups || [], // إذا كانت groups فارغة، تكون عبارة عن مصفوفة فارغة
    };

    console.log('User authenticated:', req.user);
    next(); // متابعة التنفيذ للفانكشن التالية
  } catch (error) {
    console.error('Error in authentication:', error);
    return res.status(400).json({ message: 'Invalid token.' });
  }
};



module.exports = authenticate;
