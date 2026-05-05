import { useEffect, useState } from 'react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, getStudents } from '../api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Geography'];

const initForm = { name: '', email: '', subject: '', experience: '' };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, s] = await Promise.all([getTeachers(), getStudents()]);
    setTeachers(t.data.data);
    setStudents(s.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(initForm); setModal(true); };
  const openEdit = (t) => {
    setEditing(t._id);
    setForm({ name: t.name, email: t.email, subject: t.subject, experience: t.experience });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateTeacher(editing, form);
        toast.success('Teacher updated!');
      } else {
        await createTeacher(form);
        toast.success('Teacher created!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving teacher');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? Their students will be unassigned.`)) return;
    try {
      await deleteTeacher(id);
      toast.success('Teacher deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getStudentCount = (teacherId) =>
    students.filter(s => s.teacher?._id === teacherId || s.teacher === teacherId).length;

  const getStudentNames = (teacherId) =>
    students.filter(s => s.teacher?._id === teacherId || s.teacher === teacherId).map(s => s.name);

  if (loading) return <div className="loading"><div className="spinner" /> Loading teachers...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="rel-badge otm">🔵 One-to-Many Relationship</div>
        <h2>👨‍🏫 Teachers</h2>
        <p>Each teacher supervises multiple students — demonstrates <strong>1:N relationship</strong></p>
      </div>

      <div className="topbar">
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{teachers.length}</span> teachers ·{' '}
          Teacher ID stored as FK in each Student document
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Teacher</button>
      </div>

      {teachers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍🏫</div>
          <p>No teachers yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {teachers.map(t => {
            const count = getStudentCount(t._id);
            const names = getStudentNames(t._id);
            return (
              <div key={t._id} className="entity-card teacher">
                <div className="card-header">
                  <div className="card-avatar teacher">{t.name.charAt(0).toUpperCase()}</div>
                  <div className="card-actions">
                    <button className="icon-btn edit" onClick={() => openEdit(t)} title="Edit">✏️</button>
                    <button className="icon-btn delete" onClick={() => handleDelete(t._id, t.name)} title="Delete">🗑️</button>
                  </div>
                </div>
                <div className="card-name">{t.name}</div>
                <div className="card-sub">{t.email}</div>
                <div className="card-tags">
                  <span className="tag grade">{t.subject}</span>
                  <span className="tag code">{t.experience} yrs exp</span>
                </div>

                {/* ONE-TO-MANY visualization */}
                <div className="card-rel-section">
                  <div className="card-rel-title">🔵 Students (1:N) — {count} supervised</div>
                  <div className="rel-chips">
                    {count === 0
                      ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No students assigned</span>
                      : names.map(name => <span key={name} className="rel-chip otm">{name}</span>)
                    }
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
            <h3>👨‍🏫 {editing ? 'Edit' : 'New'} Teacher</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@school.edu" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" min={0} value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="5" />
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
