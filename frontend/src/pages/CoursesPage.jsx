import { useEffect, useState } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api';
import toast from 'react-hot-toast';

const initForm = { title: '', code: '', description: '', credits: 3, maxCapacity: 30 };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getCourses();
    setCourses(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(initForm); setModal(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({ title: c.title, code: c.code, description: c.description || '', credits: c.credits, maxCapacity: c.maxCapacity });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(editing, form);
        toast.success('Course updated!');
      } else {
        await createCourse(form);
        toast.success('Course created!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving course');
    }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? Students will be unenrolled.`)) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading courses...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="rel-badge mtm">🟣 Many-to-Many Relationship</div>
        <h2>📚 Courses</h2>
        <p>Courses can have many students and students can enroll in many courses — <strong>M:N bidirectional</strong></p>
      </div>

      <div className="topbar">
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{courses.length}</span> courses ·{' '}
          Course IDs stored in <code style={{ color: 'var(--mtm)', background: 'var(--mtm-bg)', padding: '1px 6px', borderRadius: 4 }}>enrolledCourses[]</code> on Student doc
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Course</button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {courses.map(c => {
            const enrolled = c.enrolledStudents || [];
            const pct = Math.min(100, Math.round((enrolled.length / c.maxCapacity) * 100));
            return (
              <div key={c._id} className="entity-card course">
                <div className="card-header">
                  <div className="card-avatar course">📚</div>
                  <div className="card-actions">
                    <button className="icon-btn edit" onClick={() => openEdit(c)}>✏️</button>
                    <button className="icon-btn delete" onClick={() => handleDelete(c._id, c.title)}>🗑️</button>
                  </div>
                </div>
                <div className="card-name">{c.title}</div>
                <div className="card-sub">{c.description || 'No description'}</div>
                <div className="card-tags">
                  <span className="tag code">{c.code}</span>
                  <span className="tag credits">{c.credits} credits</span>
                  <span className="tag capacity">Cap: {c.maxCapacity}</span>
                </div>

                {/* Enrollment bar */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Enrollment</span>
                    <span>{enrolled.length}/{c.maxCapacity} ({pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: pct > 80 ? 'var(--rose)' : 'linear-gradient(90deg, var(--violet), var(--indigo))',
                      borderRadius: 999,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>

                {/* M:N — Enrolled Students */}
                <div className="card-rel-section">
                  <div className="card-rel-title">🟣 Enrolled Students (M:N) — {enrolled.length}</div>
                  <div className="enrollment-section">
                    {enrolled.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No students enrolled</span>
                    ) : (
                      <div className="enrolled-list">
                        {enrolled.slice(0, 4).map(s => (
                          <div key={s._id || s} className="enrolled-item">
                            <strong>🎓 {s.name || s}</strong>
                            <span>{s.grade || ''}</span>
                          </div>
                        ))}
                        {enrolled.length > 4 && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
                            +{enrolled.length - 4} more students
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>📚 {editing ? 'Edit' : 'New'} Course</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Title</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Introduction to Algebra" />
                </div>
                <div className="form-group">
                  <label>Course Code</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MATH101" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief course description..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credits</label>
                  <input type="number" min={1} max={6} value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Max Capacity</label>
                  <input type="number" min={1} max={200} value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} />
                </div>
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
