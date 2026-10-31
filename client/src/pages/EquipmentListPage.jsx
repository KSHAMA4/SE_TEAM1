import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ReservationModal from '../components/ReservationModal';
import { Search, Filter, CheckCircle2, AlertOctagon, Wrench, Calendar, Beaker } from 'lucide-react';

export default function EquipmentListPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeItemForBooking, setActiveItemForBooking] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, [search, selectedLab, selectedStatus]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedLab) params.lab = selectedLab;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/equipment', { params });
      setEquipmentList(res.data.equipment || []);
    } catch (err) {
      console.error('Failed to load equipment catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Available
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Wrench className="w-3.5 h-3.5 mr-1" /> Maintenance
          </span>
        );
      case 'OUT_OF_ORDER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Out of Order
          </span>
        );
      default:
        return null;
    }
  };

  const getCalibrationBadge = (calibrationStatus, expirationDate) => {
    const isExpired = calibrationStatus === 'EXPIRED';
    const dateFormatted = new Date(expirationDate).toLocaleDateString();

    return (
      <span
        title={`Expires: ${dateFormatted}`}
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${
          isExpired
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}
      >
        {isExpired ? '⚠️ Calib: Expired' : '✓ Calib: Valid'}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Equipment Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse calibrated scientific instruments and reserve a 2-hour slot (up to 7 days in advance).
          </p>
        </div>
      </div>

      {/* Filter / Search Bar (FR-007) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by equipment name, model or keyword..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Laboratories / Depts</option>
            <option value="Physics">Advanced Physics Lab</option>
            <option value="Computer Science">Embedded Systems & IoT Lab</option>
            <option value="Electronics">RF & Microwave Engg Lab</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_ORDER">Out of Order</option>
          </select>
        </div>
      </div>

      {/* Equipment List Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading equipment inventory...</div>
      ) : equipmentList.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No matching equipment found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search terms or clearing status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((item) => (
            <div
              key={item.equipment_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-base leading-snug">
                    {item.name}
                  </h3>
                  {getStatusBadge(item.status)}
                </div>

                <p className="text-xs text-gray-500 font-mono mb-3">
                  Model: {item.model_number || 'Standard Laboratory Grade'}
                </p>

                <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Laboratory:</span>
                    <span className="font-medium text-gray-700">{item.lab_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="font-medium text-gray-700">{item.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Building / Loc:</span>
                    <span className="font-medium text-gray-700">{item.location_building}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">Calibration:</span>
                    {getCalibrationBadge(item.calibration_status, item.calibration_expiration)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Equipment #{item.equipment_id}</span>
                <button
                  onClick={() => setActiveItemForBooking(item)}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Slot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Dialog Modal */}
      {activeItemForBooking && (
        <ReservationModal
          equipment={activeItemForBooking}
          onClose={() => setActiveItemForBooking(null)}
          onSuccess={() => {
            fetchEquipment();
          }}
        />
      )}
    </div>
  );
}
