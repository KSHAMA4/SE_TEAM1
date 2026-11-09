import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then(res => setLogs(res.data.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading logs...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Admin — Audit Logs</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['#','Actor','Action','Target','Time'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map(l => (
              <tr key={l.log_id}>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{l.log_id}</td>
                <td className="px-4 py-3 font-medium">{l.actor_name || 'System'}<br/><span className="text-xs text-gray-400">{l.actor_email}</span></td>
                <td className="px-4 py-3 font-semibold text-blue-700">{l.action}</td>
                <td className="px-4 py-3 text-gray-500">{l.target_table}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-gray-400 py-8">No audit logs yet. Try logging in and out.</p>}
      </div>
    </div>
  );
}