import { useEffect, useState } from 'react';
import { getTeachers, getStudents, getCourses } from '../api';

export default function DashboardPage({ onNavigate }) {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTeachers(), getStudents(), getCourses()])
      .then(([t, s, c]) => {
        setTeachers(t.data.data);
        setStudents(s.data.data);
        setCourses(c.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;

  const totalEnrollments = students.reduce((acc, s) => acc + (s.enrolledCourses?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>Overview of School Management System — MongoDB CRUD with Relationships</p>
      </div>

      {/* Stats */}
      <div className="stats-strip">
        {[
          { icon: '👨‍🏫', num: teachers.length, label: 'Teachers', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', action: 'teachers' },
          { icon: '🎓', num: students.length, label: 'Students', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', action: 'students' },
          { icon: '📚', num: courses.length, label: 'Courses', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', action: 'courses' },
          { icon: '📝', num: totalEnrollments, label: 'Enrollments', color: '#10b981', bg: 'rgba(16,185,129,0.12)', action: null },
        ].map(s => (
          <div
            key={s.label}
            className="stat-card"
            style={{ cursor: s.action ? 'pointer' : 'default' }}
            onClick={() => s.action && onNavigate(s.action)}
          >
            <div className="stat-icon" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Relationship Diagram */}
      <div className="diagram-card">
        <h3>🔗 Schema Relationship Diagram</h3>
        <div className="diagram-flow">
          <div className="diagram-node teacher">👨‍🏫 Teacher</div>

          <div className="diagram-arrow">
            <div className="arrow-label">1 : Many</div>
            <div className="arrow-line otm">
              <div className="line" />
              <span className="arrowhead">▶</span>
            </div>
            <div className="arrow-label" style={{ color: 'var(--otm)', fontSize: 10 }}>One-to-Many</div>
          </div>

          <div className="diagram-node student">🎓 Student</div>

          <div className="diagram-arrow">
            <div className="arrow-label">Many : Many</div>
            <div className="arrow-line mtm">
              <span className="arrowhead" style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>▶</span>
              <div className="line" />
              <span className="arrowhead">▶</span>
            </div>
            <div className="arrow-label" style={{ color: 'var(--mtm)', fontSize: 10 }}>Many-to-Many</div>
          </div>

          <div className="diagram-node course">📚 Course</div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--otm-bg)', borderRadius: 10, border: '1px solid rgba(6,182,212,0.2)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--otm)', marginBottom: 6 }}>🔵 One-to-Many (Teacher → Students)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              One teacher supervises many students. Each student document stores a <code style={{ color: 'var(--otm)', background: 'rgba(6,182,212,0.1)', padding: '1px 5px', borderRadius: 4 }}>teacher: ObjectId</code> FK reference. Querying students by teacher ID returns all associated students.
            </div>
          </div>
          <div style={{ padding: 14, background: 'var(--mtm-bg)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mtm)', marginBottom: 6 }}>🟣 Many-to-Many (Students ↔ Courses)</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Students enroll in many courses; courses have many students. Stored as arrays: <code style={{ color: 'var(--mtm)', background: 'rgba(139,92,246,0.1)', padding: '1px 5px', borderRadius: 4 }}>enrolledCourses[]</code> in Student and <code style={{ color: 'var(--mtm)', background: 'rgba(139,92,246,0.1)', padding: '1px 5px', borderRadius: 4 }}>enrolledStudents[]</code> in Course — kept in sync bidirectionally.
            </div>
          </div>
        </div>
      </div>

      {/* Overview tables */}
      <div className="dashboard-grid">
        {/* Teacher → Students (1:N) */}
        <div className="db-section">
          <h4><span style={{ color: 'var(--otm)' }}>🔵</span> 1:N — Teachers & Their Students</h4>
          {teachers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No teachers yet. Add some!</p>
          ) : teachers.map(t => {
            const myStudents = students.filter(s => s.teacher?._id === t._id || s.teacher === t._id);
            return (
              <div key={t._id} className="db-row">
                <div>
                  <div className="name">👨‍🏫 {t.name}</div>
                  <div className="meta">{t.subject}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="tag teacher-ref">{myStudents.length} students</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Student → Courses (M:N) */}
        <div className="db-section">
          <h4><span style={{ color: 'var(--mtm)' }}>🟣</span> M:N — Students & Enrolled Courses</h4>
          {students.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No students yet. Add some!</p>
          ) : students.slice(0, 6).map(s => (
            <div key={s._id} className="db-row">
              <div>
                <div className="name">🎓 {s.name}</div>
                <div className="meta">{s.teacher?.name || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tag course-ref">{s.enrolledCourses?.length || 0} courses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
