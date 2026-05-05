const mongoose = require('mongoose');

// MANY side of ONE-TO-MANY (Student belongs to one Teacher)
// ONE side of MANY-TO-MANY (Student <-> Courses via enrollments array)
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  age: { type: Number, required: true },
  grade: { type: String, required: true },

  // ONE-TO-MANY: each student has ONE teacher (FK reference)
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },

  // MANY-TO-MANY: a student can enroll in MANY courses
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
