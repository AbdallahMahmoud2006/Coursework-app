const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getSemesters: () => request("/semesters"),
  createSemester: (name) =>
    request("/semesters", { method: "POST", body: JSON.stringify({ name }) }),
  deleteSemester: (id) => request(`/semesters/${id}`, { method: "DELETE" }),

  getSubjects: (semesterId) => request(`/subjects/semester/${semesterId}`),
  getSubject: (id) => request(`/subjects/${id}`),
  createSubject: (name, semesterId) =>
    request("/subjects", {
      method: "POST",
      body: JSON.stringify({ name, semesterId }),
    }),
  deleteSubject: (id) => request(`/subjects/${id}`, { method: "DELETE" }),

  getWeeks: (subjectId) => request(`/weeks/subject/${subjectId}`),
  createWeek: (weekNumber, subjectId) =>
    request("/weeks", {
      method: "POST",
      body: JSON.stringify({ weekNumber, subjectId }),
    }),
  deleteWeek: (id) => request(`/weeks/${id}`, { method: "DELETE" }),

  getPdfs: (weekId) => request(`/pdfs/week/${weekId}`),
  getPdf: (id) => request(`/pdfs/${id}`),
  uploadPdf: async (file, weekId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("weekId", weekId);
    const res = await fetch(`${BASE_URL}/pdfs`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },
  deletePdf: (id) => request(`/pdfs/${id}`, { method: "DELETE" }),
  getAllPdfs: () => request("/pdfs"),
  updatePdf: (id, fields) =>
    request(`/pdfs/${id}`, { method: "PUT", body: JSON.stringify(fields) }),
  pdfFileUrl: (id) => `${BASE_URL}/pdfs/${id}/file`,

  getGradeItems: (subjectId) => request(`/grade-items/subject/${subjectId}`),
  createGradeItem: (item) =>
    request("/grade-items", { method: "POST", body: JSON.stringify(item) }),
  updateGradeItem: (id, fields) =>
    request(`/grade-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    }),
  deleteGradeItem: (id) =>
    request(`/grade-items/${id}`, { method: "DELETE" }),

  getCategories: (subjectId) => request(`/categories/subject/${subjectId}`),
  createCategory: (category) =>
    request("/categories", { method: "POST", body: JSON.stringify(category) }),
  updateCategory: (id, fields) =>
    request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  getTasks: () => request("/tasks"),
  createTask: (task) =>
    request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTask: (id, fields) =>
    request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(fields) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),

  getAllSubjects: () => request("/subjects"),

  getEvents: () => request("/events"),
  getEventsForSubject: (subjectId) => request(`/events/subject/${subjectId}`),
  createEvent: (event) =>
    request("/events", { method: "POST", body: JSON.stringify(event) }),
  updateEvent: (id, fields) =>
    request(`/events/${id}`, { method: "PUT", body: JSON.stringify(fields) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),
};
