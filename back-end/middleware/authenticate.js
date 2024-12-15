const jwt = require('jsonwebtoken');
const User = require('../models/users');



const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.replace('Bearer', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // تحقق من الـ decoded object

    // تحقق من وجود الـ user في قاعدة البيانات
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('User not found with ID:', decoded.id); // أضف رسالة لزيادة التوضيح
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      groups: user.groups
    };

    next();
  } catch (error) {
    console.error('Error during authentication:', error); // سجل أي خطأ يحدث أثناء التوثيق
    res.status(401).json({ message: 'Invalid token or user not found' });
  }
};

module.exports = authenticate;
