
import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Beaker,
  User,
  LogOut,
  Calendar,
  BookOpen,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-pes-blue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('catalog')}
          >
            <div className="bg-amber-400 p-2 rounded-lg text-blue-900">
              <Beaker className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                Smart Lab Portal
              </span>

              <span className="hidden sm:inline-block ml-2 text-xs bg-blue-800 text-blue-200 px-2 py-0.5 rounded">
                PES University
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">

              <nav className="flex space-x-2">

                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                    activeTab === 'catalog'
                      ? 'bg-blue-800 text-white shadow-inner'
                      : 'text-blue-100 hover:bg-blue-800/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Equipment Catalog</span>
                </button>

                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                    activeTab === 'reservations'
                      ? 'bg-blue-800 text-white shadow-inner'
                      : 'text-blue-100 hover:bg-blue-800/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Reservations</span>
                </button>

                {user.role === 'TECHNICIAN' && (
                  <button
                    onClick={() => setActiveTab('techDashboard')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                      activeTab === 'techDashboard'
                        ? 'bg-blue-800 text-white shadow-inner'
                        : 'text-blue-100 hover:bg-blue-800/50'
                    }`}
                  >
                    <span>Tech Dashboard</span>
                  </button>
                )}

                {user.role === 'ADMIN' && (
                  <>

                    <button
                      onClick={() => setActiveTab('adminUsers')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                        activeTab === 'adminUsers'
                          ? 'bg-blue-800 text-white shadow-inner'
                          : 'text-blue-100 hover:bg-blue-800/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>User Management</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('adminAudit')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                        activeTab === 'adminAudit'
                          ? 'bg-blue-800 text-white shadow-inner'
                          : 'text-blue-100 hover:bg-blue-800/50'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Audit Logs</span>
                    </button>

                  </>
                )}

              </nav>

              <div className="flex items-center space-x-3 border-l border-blue-700 pl-4">

                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold leading-tight">
                    {user.fullName}
                  </div>

                  <div className="text-xs text-amber-300 font-mono">
                    {user.role}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
