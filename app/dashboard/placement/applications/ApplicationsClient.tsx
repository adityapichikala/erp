'use client'

import { useState, useEffect } from 'react'

export function ApplicationsClient() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/placement/applications')
      const data = await res.json()
      if (res.ok) setApplications(data.applications)
    } catch {
      console.error('Failed to load placement applications')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/placement/applications/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Status updated')
      setTimeout(() => setToast(null), 3000)
      fetchApplications()
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Placement Applications
        </h1>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Company & Role</th>
              <th className="p-4">Applied On</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No applications found.</td></tr>
            ) : applications.map(app => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{app.student.name}</div>
                  <div className="text-xs text-gray-500">{app.student.email}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-800">{app.drive.companyName}</div>
                  <div className="text-xs text-gray-500">{app.drive.role}</div>
                </td>
                <td className="p-4 text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    app.status === 'OFFERED' ? 'bg-green-100 text-green-800' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select 
                    value={app.status} 
                    onChange={e => handleStatusChange(app.id, e.target.value)}
                    className="p-1 border rounded text-xs"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEWED">Interviewed</option>
                    <option value="OFFERED">Offered</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
