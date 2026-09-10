'use client'

import { useState, useEffect } from 'react'

export function StaffLeaveClient() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/staff/leave')
      const data = await res.json()
      if (res.ok) setRequests(data.leaveRequests)
    } catch {
      console.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/staff/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, reason })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit request')
      
      setShowForm(false)
      setToast('Leave request submitted!')
      setTimeout(() => setToast(null), 3000)
      
      setStartDate(''); setEndDate(''); setReason('')
      fetchRequests()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
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
          My Leave Requests
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Request Leave
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Submitted On</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">End Date</th>
              <th className="p-4">Reason</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">You have no leave requests.</td></tr>
            ) : requests.map(req => (
              <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="p-4 font-medium">{new Date(req.startDate).toLocaleDateString()}</td>
                <td className="p-4 font-medium">{new Date(req.endDate).toLocaleDateString()}</td>
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
                      Reviewed on {new Date(req.reviewedAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-md my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Request Leave
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Start Date</label>
                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              
              <div>
                <label className="form-label block font-medium mb-1">End Date</label>
                <input type="date" required min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>

              <div>
                <label className="form-label block font-medium mb-1">Reason</label>
                <textarea required value={reason} onChange={e => setReason(e.target.value)} className="form-input w-full p-2 border rounded" rows={3} placeholder="Please provide a brief reason..."></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
