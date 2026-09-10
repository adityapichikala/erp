'use client'

import { useState, useEffect } from 'react'

export function LeaveRequestsClient() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/hr/leaves')
      const data = await res.json()
      if (res.ok) setRequests(data.leaveRequests)
    } catch {
      console.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this leave request?`)) return
    
    try {
      const res = await fetch(`/api/hr/leaves/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast(`Request ${action.toLowerCase()}`)
      setTimeout(() => setToast(null), 3000)
      fetchRequests()
    } catch (err: any) {
      alert(err.message || 'Failed to update request')
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
          Leave Requests
        </h1>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Department</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Reason</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No leave requests found.</td></tr>
            ) : requests.map(req => (
              <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{req.employee.user.name}</div>
                  <div className="text-xs text-gray-500">{req.employee.user.email}</div>
                </td>
                <td className="p-4 text-gray-600">{req.employee.department.name}</td>
                <td className="p-4 text-gray-600">
                  {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-gray-600 max-w-xs truncate" title={req.reason}>
                  {req.reason}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
                  {req.reviewedAt && (
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(req.reviewedAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="p-4 text-right space-x-3">
                  {req.status === 'PENDING' ? (
                    <>
                      <button onClick={() => handleAction(req.id, 'APPROVED')} className="text-green-600 font-medium hover:underline text-sm">Approve</button>
                      <button onClick={() => handleAction(req.id, 'REJECTED')} className="text-red-600 font-medium hover:underline text-sm">Reject</button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
