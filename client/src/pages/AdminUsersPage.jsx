import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      alert('Role updated successfully!');
      fetchUsers();
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Admin — User Management</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['ID','Full Name','Email','Current Role','Late Returns','Change Role'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.user_id}>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{u.user_id}</td>
                <td className="px-4 py-3 font-medium">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-center text-sm">{u.late_return_count}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.role}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}