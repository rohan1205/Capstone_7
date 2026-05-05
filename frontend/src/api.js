import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// ── Teachers ──────────────────────────────────────────────
export const getTeachers = () => API.get('/teachers');
export const getTeacher = (id) => API.get(`/teachers/${id}`);
export const createTeacher = (data) => API.post('/teachers', data);
export const updateTeacher = (id, data) => API.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => API.delete(`/teachers/${id}`);

// ── Students ──────────────────────────────────────────────
export const getStudents = () => API.get('/students');
export const getStudent = (id) => API.get(`/students/${id}`);
export const createStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);
export const toggleEnroll = (studentId, courseId) =>
  API.post(`/students/${studentId}/enroll/${courseId}`);

// ── Courses ───────────────────────────────────────────────
export const getCourses = () => API.get('/courses');
export const getCourse = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
