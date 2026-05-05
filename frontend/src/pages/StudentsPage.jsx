import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getCourses, createStudent, updateStudent, deleteStudent } from '../api';
import toast from 'react-hot-toast';

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const initForm = { name: '', email: '', age: '', grade: '', teacher: '', enrolledCourses: [] };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, t, c] = await Promise.all([getStudents(), getTeachers(), getCourses()]);
    setStudents(s.data.data);
    setTeachers(t.data.data);
    setCourses(c.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(initForm); setModal(true); };
  const openEdit = (s) => {
    setEditing(s._id);
    setForm({
      name: s.name,
      email: s.email,
      age: s.age,
      grade: s.grade,
      teacher: s.teacher?._id || s.teacher || '',
      enrolledCourses: s.enrolledCourses?.map(c => c._id || c) || [],
    });
    setModal(true);
  };

  const toggleCourse = (courseId) => {
    setForm(f => ({
      ...f,
      enrolledCourses: f.enrolledCourses.includes(courseId)
        ? f.enrolledCourses.filter(id => id !== courseId)
        : [...f.enrolledCourses, courseId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateStudent(editing, form);
        toast.success('Student updated!');
      } else {
        await createStudent(form);
        toast.success('Student created!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading students...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div className="rel-badge otm">🔵 Many side of 1:N</div>
          <div className="rel-badge mtm">🟣 Many-to-Many (Courses)</div>
        </div>
        <h2>🎓 Students</h2>
        <p>Students belong to one teacher (1:N) and enroll in many courses (M:N)</p>
      </div>

      <div className="topbar">
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{students.length}</span> students registered
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Student</button>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <p>No students yet. Add teachers first, then create students.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {students.map(s => (
            <div key={s._id} className="entity-card student">
              <div className="card-header">
                <div className="card-avatar student">{s.name.charAt(0).toUpperCase()}</div>
                <div className="card-actions">
                  <button className="icon-btn edit" onClick={() => openEdit(s)}>✏️</button>
                  <button className="icon-btn delete" onClick={() => handleDelete(s._id, s.name)}>🗑️</button>
                </div>
              </div>
              <div className="card-name">{s.name}</div>
              <div className="card-sub">{s.email} · Age {s.age}</div>
              <div className="card-tags">
                <span className="tag grade">{s.grade}</span>
              </div>

              {/* 1:N — Teacher */}
              <div className="card-rel-section">
                <div className="card-rel-title">🔵 Teacher (1:N FK)</div>
                {s.teacher ? (
                  <span className="rel-chip otm">👨‍🏫 {s.teacher.name} — {s.teacher.subject}</span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>
                )}
              </div>

              {/* M:N — Courses */}
              <div className="card-rel-section">
                <div className="card-rel-title">🟣 Enrolled Courses (M:N) — {s.enrolledCourses?.length || 0}</div>
                <div className="rel-chips">
                  {s.enrolledCourses?.length > 0
                    ? s.enrolledCourses.map(c => (
                        <span key={c._id || c} className="rel-chip mtm">📚 {c.title || c.code || c}</span>
                      ))
                    : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not enrolled in any course</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>🎓 {editing ? 'Edit' : 'New'} Student</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alice Johnson" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="alice@school.edu" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input required type="number" min={5} max={25} value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="16" />
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <select required value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                    <option value="">Select grade</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* 1:N — Assign Teacher */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="rel-dot otm" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--otm)', display: 'inline-block' }} />
                  Assign Teacher (1:N — FK reference)
                </label>
                <select required value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} — {t.subject}</option>)}
                </select>
              </div>

              {/* M:N — Enroll in Courses */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="rel-dot mtm" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mtm)', display: 'inline-block' }} />
                  Enroll in Courses (M:N — array of refs)
                </label>
                {courses.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No courses available. Create courses first.</p>
                ) : (
                  <div className="course-checkboxes">
                    {courses.map(c => {
                      const checked = form.enrolledCourses.includes(c._id);
                      return (
                        <div key={c._id} className={`course-checkbox-item ${checked ? 'checked' : ''}`} onClick={() => toggleCourse(c._id)}>
                          <input type="checkbox" checked={checked} readOnly />
                          <span className="course-checkbox-label">{c.title}</span>
                          <span className="course-checkbox-sub">{c.code} · {c.credits} cr</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : editing ? '✅ Update' : '➕ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
