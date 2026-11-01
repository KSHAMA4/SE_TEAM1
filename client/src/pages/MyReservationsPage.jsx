import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Clock, Key, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations/me');
      setReservations(res.data.reservations || []);
    } catch (err) {
      console.error('Failed to load student reservations', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Equipment Reservations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirmed reservation slots with issued cryptographic authorization tokens.
          </p>
        </div>
        <button
          onClick={fetchMyReservations}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No reservations found</h3>
          <p className="text-sm text-gray-500 mt-1">
            You do not have any active equipment slots reserved yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((item) => (
            <div
              key={item.reservation_id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-gray-900">{item.equipment_name}</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.lab_name} • {item.model_number || 'Standard Equipment'}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(item.start_time).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-shrink-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center mb-1">
                  <Key className="w-3 h-3 mr-1 text-blue-600" />
                  Reservation UUID Token:
                </div>
                <div className="font-mono text-xs font-bold text-blue-900 select-all break-all">
                  {item.token}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
