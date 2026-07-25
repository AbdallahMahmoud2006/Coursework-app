import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Semesters from "./pages/Semesters";
import SubjectHub from "./pages/SubjectHub";
import Weeks from "./pages/Weeks";
import WeekContent from "./pages/WeekContent";
import PdfViewer from "./pages/PdfViewer";
import Grades from "./pages/Grades";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
    >
      {children}
    </NavLink>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="sidebar">
          <div className="sidebar-brand">Course<span>work</span></div>
          <SidebarLink to="/">Dashboard</SidebarLink>
          <SidebarLink to="/semesters">Semesters</SidebarLink>
          <SidebarLink to="/tasks">To-Do</SidebarLink>
          <SidebarLink to="/calendar">Calendar</SidebarLink>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/semesters" element={<Semesters />} />
            <Route
              path="/semesters/:semesterId/subjects/:subjectId"
              element={<SubjectHub />}
            />
            <Route
              path="/semesters/:semesterId/subjects/:subjectId/weeks"
              element={<Weeks />}
            />
            <Route
              path="/semesters/:semesterId/subjects/:subjectId/weeks/:weekId"
              element={<WeekContent />}
            />
            <Route
              path="/semesters/:semesterId/subjects/:subjectId/weeks/:weekId/pdf/:pdfId"
              element={<PdfViewer />}
            />
            <Route
              path="/semesters/:semesterId/subjects/:subjectId/grades"
              element={<Grades />}
            />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
