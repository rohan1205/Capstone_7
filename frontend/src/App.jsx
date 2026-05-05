import { useEffect, useState } from 'react';
import {
  getTeachers, createTeacher, deleteTeacher,
  getStudents, createStudent, deleteStudent,
  getCourses, createCourse, deleteCourse
} from './api';

export default function App() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [modal, setModal] = useState(null); // 'teacher', 'student', 'course'
  
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '' });
  const [studentForm, setStudentForm] = useState({ name: '', teacher: '', enrolledCourses: [] });
  const [courseForm, setCourseForm] = useState({ title: '' });

  const loadData = async () => {
    const [t, s, c] = await Promise.all([getTeachers(), getStudents(), getCourses()]);
    setTeachers(t.data.data);
    setStudents(s.data.data);
    setCourses(c.data.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEnrollments = students.reduce((acc, s) => acc + (s.enrolledCourses?.length || 0), 0);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    await createTeacher({ ...teacherForm, email: `${teacherForm.name.replace(/\s+/g, '').toLowerCase()}@school.edu` });
    setModal(null);
    setTeacherForm({ name: '', subject: '' });
    loadData();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    await createStudent({
      ...studentForm,
      email: `${studentForm.name.replace(/\s+/g, '').toLowerCase()}@student.edu`,
      age: 15,
      grade: 'Grade 10'
    });
    setModal(null);
    setStudentForm({ name: '', teacher: '', enrolledCourses: [] });
    loadData();
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    await createCourse({
      ...courseForm,
      code: courseForm.title.substring(0, 3).toUpperCase() + '101'
    });
    setModal(null);
    setCourseForm({ title: '' });
    loadData();
  };

  const handleDeleteTeacher = async (id) => {
    await deleteTeacher(id);
    loadData();
  };

  const handleDeleteStudent = async (id) => {
    await deleteStudent(id);
    loadData();
  };

  const handleDeleteCourse = async (id) => {
    await deleteCourse(id);
    loadData();
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h1>SchoolDB</h1>
      </nav>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-value">{teachers.length}</span>
          <span className="stat-label">Teachers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{students.length}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{courses.length}</span>
          <span className="stat-label">Courses</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalEnrollments}</span>
          <span className="stat-label">Enrollments</span>
        </div>
      </div>

      <div className="grid">
        {/* Teachers Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Teachers</h2>
            <button onClick={() => setModal('teacher')}>Add</button>
          </div>
          <div className="list">
            {teachers.map(t => (
              <div key={t._id} className="card">
                <div className="card-content">
                  <span className="card-title">{t.name}</span>
                  <span className="card-subtitle">{t.subject}</span>
                </div>
                <button onClick={() => handleDeleteTeacher(t._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* Students Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Students (1:N)</h2>
            <button onClick={() => setModal('student')}>Add</button>
          </div>
          <div className="list">
            {students.map(s => (
              <div key={s._id} className="card">
                <div className="card-content">
                  <span className="card-title">{s.name}</span>
                  <span className="card-subtitle">Teacher: {s.teacher?.name || 'None'}</span>
                </div>
                <button onClick={() => handleDeleteStudent(s._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Courses</h2>
            <button onClick={() => setModal('course')}>Add</button>
          </div>
          <div className="list">
            {courses.map(c => (
              <div key={c._id} className="card">
                <div className="card-content">
                  <span className="card-title">{c.title}</span>
                  <span className="card-subtitle">{c.code}</span>
                </div>
                <button onClick={() => handleDeleteCourse(c._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollments Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Enrollments (M:N)</h2>
          </div>
          <div className="list">
            {students.map(s => (
              <div key={s._id} className="enrollment-item">
                <div className="enrollment-student">{s.name}</div>
                <div className="enrollment-courses">
                  {s.enrolledCourses?.length > 0 ? (
                    s.enrolledCourses.map(c => (
                      <div key={c._id || c}>{c.title || c}</div>
                    ))
                  ) : (
                    <div>No courses</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'teacher' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="section-title">Add Teacher</h2>
            </div>
            <form onSubmit={handleCreateTeacher}>
              <div className="form-group">
                <label>Name</label>
                <input required value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input required value={teacherForm.subject} onChange={e => setTeacherForm({...teacherForm, subject: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'student' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="section-title">Add Student</h2>
            </div>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label>Name</label>
                <input required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Teacher (1:N)</label>
                <select required value={studentForm.teacher} onChange={e => setStudentForm({...studentForm, teacher: e.target.value})}>
                  <option value="">Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Courses (M:N)</label>
                <select multiple value={studentForm.enrolledCourses} onChange={e => {
                  const options = [...e.target.selectedOptions];
                  const values = options.map(option => option.value);
                  setStudentForm({...studentForm, enrolledCourses: values});
                }} style={{ height: '100px' }}>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
                <small style={{display: 'block', marginTop: '0.5rem', color: '#666'}}>Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'course' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="section-title">Add Course</h2>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label>Title</label>
                <input required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
