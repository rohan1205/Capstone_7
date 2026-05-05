const mongoose = require('mongoose');

// MANY side of MANY-TO-MANY (Course <-> Students)
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  credits: { type: Number, default: 3 },
  maxCapacity: { type: Number, default: 30 },

  // MANY-TO-MANY: a course has MANY enrolled students
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
