import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SupabaseConfigProvider } from './context/SupabaseConfigContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Events } from './pages/public/Events';
import { EventDetails } from './pages/public/EventDetails';
import { Schedule } from './pages/public/Schedule';
import { Results } from './pages/public/Results';
import { Teams } from './pages/public/Teams';
import { TeamDetails } from './pages/public/TeamDetails';
import { About } from './pages/public/About';

// Admin Pages
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Participants } from './pages/admin/Participants';
import { Teams as TeamsAdmin } from './pages/admin/Teams';
import { Events as EventsAdmin } from './pages/admin/Events';
import { Assignments } from './pages/admin/Assignments';
import { Results as ResultsAdmin } from './pages/admin/Results';
import { Adjustments } from './pages/admin/Adjustments';
import { Schedule as ScheduleAdmin } from './pages/admin/Schedule';
import { Settings } from './pages/admin/Settings';
import { ScrollToTop } from './components/ScrollToTop';

export function App() {
  return (
    <SupabaseConfigProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Routes>
            {/* Public Fest Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/results" element={<Results />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="participants" element={<Participants />} />
              <Route path="teams" element={<TeamsAdmin />} />
              <Route path="events" element={<EventsAdmin />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="results" element={<ResultsAdmin />} />
              <Route path="adjustments" element={<Adjustments />} />
              <Route path="schedule" element={<ScheduleAdmin />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SupabaseConfigProvider>
  );
}

export default App;
