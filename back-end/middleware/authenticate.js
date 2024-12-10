const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  const token = authHeader.replace('Bearer', '').trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // طباعة التوكن بعد فك تشفيره
    req.user = { id: decoded.id, role: decoded.role }; // تخزين id بدلاً من _id
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
module.exports = authenticate;
