import { Navigate } from 'react-router-dom';

export default function IsiboLeaderRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token || role !== 'Isibo Leader') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
