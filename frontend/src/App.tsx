import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LandingPage from './pages/LandingPage';
import AuditPolicyPage from './pages/AuditPolicyPage';
import MissionPage from './pages/MissionPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';

// Validate token by checking its expiry instead of just checking presence
function isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // JWT tokens are structured as header.payload.signature
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= expiresAt) {
            // Token expired — clean up
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
        return true;
    } catch {
        // Invalid token format — clean up
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
    }
}

// ProtectedRoute: rechecks auth on every render AND on a 60-second timer,
// so an expired token auto-redirects without requiring a manual page refresh.
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const [auth, setAuth] = useState(isTokenValid);

    useEffect(() => {
        const interval = setInterval(() => {
            setAuth(isTokenValid());
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

    return auth ? element : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/audit-policy" element={<AuditPolicyPage />} />
                        <Route path="/mission" element={<MissionPage />} />
                        <Route path="/" element={<LandingPage />} />
                        <Route
                            path="/dashboard"
                            element={<ProtectedRoute element={<Dashboard />} />}
                        />
                    </Routes>
                </Router>
            </ToastProvider>
        </ErrorBoundary>
    );
};

export default App;
