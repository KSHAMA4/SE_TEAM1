
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Calendar,
  Clock,
  Key,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMyReservations = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.get('/reservations/me');
      setReservations(res.data.reservations || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setErrorMessage(
        err.response?.data?.message ||
        'Unable to load your reservations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation? This action cannot be undone.'
    );

    if (!confirmed) return;

    setCancellingId(reservationId);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.post(
        `/reservations/${reservationId}/cancel`
      );

      setSuccessMessage(
        response.data.message || 'Reservation cancelled successfully.'
      );

      // Refresh the list to show the updated database status.
      await fetchMyReservations();
    } catch (err) {
      console.error('Reservation cancellation failed:', err);

      setErrorMessage(
        err.response?.data?.message ||
        'Failed to cancel reservation. Please try again.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Equipment Reservations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your equipment reservations.
          </p>
        </div>

        <button
          onClick={fetchMyReservations}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading your reservations...
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">
            No reservations found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            You do not have any equipment slots reserved yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((item) => (
            <div
              key={item.reservation_id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {item.equipment_name}
                  </h3>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {item.lab_name} • {item.model_number || 'Standard Equipment'}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(item.start_time).toLocaleDateString()}
                  </span>

                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(item.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {' - '}
                    {new Date(item.end_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {item.token && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center mb-1">
                      <Key className="w-3 h-3 mr-1 text-blue-600" />
                      Reservation UUID Token
                    </div>
                    <div className="font-mono text-xs font-bold text-blue-900 select-all break-all">
                      {item.token}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                {item.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancel(item.reservation_id)}
                    disabled={cancellingId !== null}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {cancellingId === item.reservation_id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Reservation
                      </>
                    )}
                  </button>
                )}

                {item.status === 'CANCELLED' && (
                  <span className="text-xs text-red-600 font-medium">
                    Reservation cancelled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
