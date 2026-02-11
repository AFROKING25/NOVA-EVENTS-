import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import DesignCard from './pages/DesignCard';
import CardLayoutEditor from './pages/CardLayoutEditor';
import CardPreview from './pages/CardPreview';
import SetupPayments from './pages/SetupPayments';
import ContributionPage from './pages/ContributionPage';
import ManageTemplates from './pages/ManageTemplates';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Navigation from './components/Navigation';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = localStorage.getItem('nova_user');
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('nova_user') || 'null'));
  const location = useLocation();
  const isGuestView = location.pathname.startsWith('/e/');

  const handleLogin = (userData: any) => {
    localStorage.setItem('nova_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('nova_user');
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: any) => {
    localStorage.setItem('nova_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {!isGuestView && user && <Navigation onLogout={handleLogout} user={user} />}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          } />
          
          <Route path="/design-card/:eventId" element={
            <ProtectedRoute>
              <DesignCard />
            </ProtectedRoute>
          } />

          <Route path="/layout-editor/:eventId" element={
            <ProtectedRoute>
              <CardLayoutEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/card-preview/:eventId" element={
            <ProtectedRoute>
              <CardPreview />
            </ProtectedRoute>
          } />
          
          <Route path="/setup-payments/:eventId" element={
            <ProtectedRoute>
              <SetupPayments />
            </ProtectedRoute>
          } />

          <Route path="/manage-templates/:eventId" element={
            <ProtectedRoute>
              <ManageTemplates />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile user={user} onUpdateUser={handleUpdateUser} />
            </ProtectedRoute>
          } />
          
          <Route path="/e/:eventId/:guestId" element={<ContributionPage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="py-6 text-center text-gray-500 text-[10px] uppercase font-black tracking-[0.5em] border-t border-white/5">
        NOVA EVENTS by AFROKING™ &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;