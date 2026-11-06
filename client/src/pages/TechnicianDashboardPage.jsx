
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TechnicianDashboardPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const res = await api.get('/reservations/all');
      setReservations(res.data.reservations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleReturn = async (id) => {
    if (!window.confirm('Mark this reservation as returned?')) return;

    try {
      const res = await api.post(`/reservations/${id}/return`);
      alert(res.data.message || 'Marked returned');
      fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || 'Return failed');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading reservations...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">
        Technician Dashboard — All Reservations
      </h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Student', 'Equipment', 'Start', 'End', 'Status', 'Action'].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {reservations.map(r => (
              <tr key={r.reservation_id}>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {r.reservation_id}
                </td>

                <td className="px-4 py-3 font-medium">
                  {r.student_name || r.student_email || 'Student'}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {r.equipment_name || `Equipment #${r.equipment_id}`}
                </td>

                <td className="px-4 py-3 text-xs">
                  {new Date(r.start_time).toLocaleString()}
                </td>

                <td className="px-4 py-3 text-xs">
                  {new Date(r.end_time).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-700'
                      : r.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-700'
                      : r.status === 'LATE_RETURNED'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {r.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {r.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleReturn(r.reservation_id)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                      Mark Returned
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reservations.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No reservations found.
          </p>
        )}
      </div>
    </div>
  );
}
