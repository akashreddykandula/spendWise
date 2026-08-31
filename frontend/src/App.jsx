import {Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './pages/app/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Transactions from './pages/app/Transactions';
import Analytics from './pages/app/Analytics';
import Settings from './pages/app/Settings';
import Reports from './pages/app/Reports';

function App () {
  return (
    <Routes>
      {/* 🌐 Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 🔐 Protected App */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />

      </Route>
    </Routes>
  );
}

export default App;
