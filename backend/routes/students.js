const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');

// GET all students with populated teacher and courses
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .populate('teacher', 'name subject')
      .populate('enrolledCourses', 'title code credits')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('teacher', 'name email subject')
      .populate('enrolledCourses', 'title code credits description');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    // If student enrolls in courses on creation, update Course documents too (MANY-TO-MANY sync)
    if (req.body.enrolledCourses && req.body.enrolledCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: req.body.enrolledCourses } },
        { $addToSet: { enrolledStudents: student._id } }
      );
    }

    const populated = await Student.findById(student._id)
      .populate('teacher', 'name subject')
      .populate('enrolledCourses', 'title code credits');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) return res.status(404).json({ success: false, message: 'Student not found' });

    const newCourses = req.body.enrolledCourses || [];
    const oldCourses = oldStudent.enrolledCourses.map(id => id.toString());

    // Courses that were removed
    const removedCourses = oldCourses.filter(id => !newCourses.includes(id));
    // Courses that were added
    const addedCourses = newCourses.filter(id => !oldCourses.includes(id));

    // Update Course documents bidirectionally (MANY-TO-MANY sync)
    if (removedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: removedCourses } },
        { $pull: { enrolledStudents: oldStudent._id } }
      );
    }
    if (addedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: addedCourses } },
        { $addToSet: { enrolledStudents: oldStudent._id } }
      );
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('teacher', 'name subject')
      .populate('enrolledCourses', 'title code credits');

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Remove student from all enrolled courses (MANY-TO-MANY cleanup)
    await Course.updateMany(
      { enrolledStudents: student._id },
      { $pull: { enrolledStudents: student._id } }
    );

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST enroll/unenroll student in a course (MANY-TO-MANY toggle)
router.post('/:studentId/enroll/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({ success: false, message: 'Student or Course not found' });
    }

    const isEnrolled = student.enrolledCourses.includes(courseId);

    if (isEnrolled) {
      // Unenroll
      await Student.findByIdAndUpdate(studentId, { $pull: { enrolledCourses: courseId } });
      await Course.findByIdAndUpdate(courseId, { $pull: { enrolledStudents: studentId } });
      res.json({ success: true, message: `${student.name} unenrolled from ${course.title}`, enrolled: false });
    } else {
      // Enroll
      await Student.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
      await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: studentId } });
      res.json({ success: true, message: `${student.name} enrolled in ${course.title}`, enrolled: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
