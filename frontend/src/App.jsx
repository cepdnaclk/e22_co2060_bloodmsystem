import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RoleRoute from './api/RoleRoute';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorEligibility from './pages/donor/DonorEligibility';
import DonorRegistration from './pages/donor/DonorRegistration';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import LabDashboard from './pages/staff/LabDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminRequests from './pages/admin/AdminRequests';
import AdminEmergency from './pages/admin/AdminEmergency';
import DummyAdminPage from './pages/admin/DummyAdminPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import ContactPage from './pages/public/ContactPage';
import Events from "./pages/events/Events";
import AboutUs from "./pages/public/AboutUs";
import Services from "./pages/public/Services";
import Unauthorized from "./pages/public/Unauthorized";
import NotFound from "./pages/public/NotFound";
import './App.css';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ─── Main Layout Routes (Public + Regular Authed) ─── */}
            <Route element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/services" element={<Services />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Donor Routes */}
              <Route path="/donor" element={
                <RoleRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </RoleRoute>
              } />
              <Route path="/donor/eligibility" element={
                <RoleRoute allowedRoles={['donor', 'admin']}>
                  <DonorEligibility />
                </RoleRoute>
              } />
              <Route path="/donor/register" element={
                <RoleRoute allowedRoles={['donor', 'admin']}>
                  <DonorRegistration />
                </RoleRoute>
              } />

              {/* Doctor / Medical Routes */}
              <Route path="/doctor" element={
                <RoleRoute allowedRoles={['doctor', 'medical_officer', 'admin']}>
                  <DoctorDashboard />
                </RoleRoute>
              } />

              {/* Lab / Staff Routes */}
              <Route path="/staff" element={
                <RoleRoute allowedRoles={['medical_officer', 'admin']}>
                  <LabDashboard />
                </RoleRoute>
              } />

              {/* Patient Routes */}
              <Route path="/patient" element={
                <RoleRoute allowedRoles={['doctor', 'medical_officer', 'admin']}>
                  <PatientDashboard />
                </RoleRoute>
              } />
            </Route>

            {/* ─── Admin Layout Routes (Admin Only) ─── */}
            <Route element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleRoute>
            }>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/emergency" element={<AdminEmergency />} />
              <Route path="/admin/stock" element={<AdminInventory />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/donors" element={<AdminUsers />} />
              <Route path="/admin/hospitals" element={<AdminHospitals />} />
              <Route path="/admin/analytics" element={<DummyAdminPage title="Analytics" />} />
              <Route path="/admin/logs" element={<DummyAdminPage title="Logs" />} />
              <Route path="/admin/settings" element={<DummyAdminPage title="Settings" />} />
            </Route>

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
