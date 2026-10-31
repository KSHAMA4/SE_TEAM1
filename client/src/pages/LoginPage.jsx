import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Beaker, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('student1@pes.edu');
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleQuickFill = (testEmail) => {
    setEmail(testEmail);
    setPassword('Password123!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-amber-400 text-blue-950 rounded-2xl shadow-xl mb-3">
          <Beaker className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Smart Lab Equipment</h2>
        <p className="mt-1 text-sm text-blue-200">Slot Reservation Portal (Team 001)</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">PES University Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="student1@pes.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in to Portal'}
            </button>
          </form>

          {/* Quick Demo Login Fillers */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Quick Test Credentials (from Test Plan):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('student1@pes.edu')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border rounded text-gray-600 font-mono transition text-left"
              >
                student1@pes.edu
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student2@pes.edu')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border rounded text-gray-600 font-mono transition text-left"
              >
                student2@pes.edu
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('tech1@pes.edu')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border rounded text-gray-600 font-mono transition text-left col-span-2"
              >
                tech1@pes.edu (Technician)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
