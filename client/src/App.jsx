import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import EquipmentListPage from './pages/EquipmentListPage';
import MyReservationsPage from './pages/MyReservationsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'catalog' && <EquipmentListPage />}
        {activeTab === 'reservations' && <MyReservationsPage />}
        {activeTab === 'techDashboard' && user.role === 'TECHNICIAN' && (<TechnicianDashboardPage />)}
        {activeTab === 'adminUsers' && user.role === 'ADMIN' && <AdminUsersPage />}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        Smart Lab Equipment Slot Reservation Portal • PES University Software Engineering Lab (Team 001)
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
