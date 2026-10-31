import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, AlertTriangle, CheckCircle, X, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

export default function ReservationModal({ equipment, onClose, onSuccess }) {
  const [date, setDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [confirmedToken, setConfirmedToken] = useState(null);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, [date]);

  const fetchAvailability = async () => {
    try {
      const res = await api.get(`/reservations/availability/${equipment.equipment_id}?date=${date}`);
      setAvailability(res.data);
    } catch (e) {
      // Non-critical
    }
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    return (eH * 60 + eM) - (sH * 60 + sM);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setErrorInfo(null);
    setLoading(true);

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    try {
      const res = await api.post('/reservations', {
        equipment_id: equipment.equipment_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });

      setConfirmedToken(res.data.reservation.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      const data = err.response?.data;
      setErrorInfo({
        status: err.response?.status,
        message: data?.message || 'Failed to complete reservation.',
        alternatives: data?.suggestedAlternatives || [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlternative = (alt) => {
    const s = new Date(alt.startTime);
    const e = new Date(alt.endTime);
    setDate(s.toISOString().split('T')[0]);
    setStartTime(s.toTimeString().substring(0, 5));
    setEndTime(e.toTimeString().substring(0, 5));
    setErrorInfo(null);
  };

  const durationMins = calculateDuration();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Reserve Equipment Slot
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {equipment.name} • {equipment.lab_name}
        </p>

        {confirmedToken ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Reservation Confirmed!</h4>
            <p className="text-sm text-gray-600 mt-1">Your access authorization token has been issued:</p>
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm font-semibold text-blue-900 select-all break-all">
              {confirmedToken}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Note: This reservation is durably saved and persists across server restarts.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 px-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleReserve} className="space-y-4">
            {errorInfo && (
              <div
                className={`p-3 rounded-lg border text-sm ${
                  errorInfo.status === 409
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">
                      {errorInfo.status === 409 ? 'Overlap Conflict (409): ' : errorInfo.status === 422 ? 'Calibration Error (422): ' : 'Error: '}
                    </span>
                    {errorInfo.message}
                  </div>
                </div>

                {errorInfo.alternatives.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-amber-200">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                      Available Alternative Slots Today:
                    </p>
                    <div className="space-y-1">
                      {errorInfo.alternatives.map((alt, idx) => {
                        const sStr = new Date(alt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const eStr = new Date(alt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAlternative(alt)}
                            className="w-full text-left text-xs bg-white hover:bg-amber-100 p-2 rounded border border-amber-300 flex justify-between items-center transition"
                          >
                            <span>{sStr} - {eStr} ({alt.durationMinutes} mins)</span>
                            <span className="text-blue-700 font-medium flex items-center">
                              Select <ArrowRight className="w-3 h-3 ml-1" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reservation Date (Max 7 Days Ahead)</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                Duration: <strong className={`ml-1 ${durationMins > 120 ? 'text-red-600' : 'text-gray-800'}`}>{durationMins} mins</strong>
              </span>
              <span className={durationMins > 120 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {durationMins > 120 ? 'Exceeds 2-hour limit (Max 120 min)' : 'Within 2-hour limit'}
              </span>
            </div>

            {/* Availability preview */}
            {availability?.bookedSlots?.length > 0 && (
              <div className="text-xs text-gray-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                <span className="font-semibold text-blue-900 block mb-1">Already Booked Slots on this Date:</span>
                <div className="flex flex-wrap gap-1">
                  {availability.bookedSlots.map((b, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-mono">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || durationMins > 120 || durationMins <= 0}
                className="w-1/2 py-2.5 px-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Confirm Slot'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
