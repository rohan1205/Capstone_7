const mongoose = require('mongoose');

// ONE side of ONE-TO-MANY relationship (Teacher -> Students)
const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  subject: { type: String, required: true, trim: true },
  experience: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
