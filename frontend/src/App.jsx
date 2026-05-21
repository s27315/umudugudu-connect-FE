import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleAssignment from './pages/RoleAssignment';
import MarkAttendance from './pages/MarkAttendance';
import Login from './pages/Login';
import AdminRoute from './components/AdminRoute';
import IsiboLeaderRoute from './components/IsiboLeaderRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/roles"
          element={
            <AdminRoute>
              <RoleAssignment />
            </AdminRoute>
          }
        />
        <Route
          path="/isibo/attendance/:activityId"
          element={
            <IsiboLeaderRoute>
              <MarkAttendance />
            </IsiboLeaderRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
