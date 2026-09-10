'use client'

import { useState, useEffect } from 'react'

export function StudentPlacementsClient() {
  const [drives, setDrives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const res = await fetch('/api/student/placements')
      const data = await res.json()
      if (res.ok) setDrives(data.drives)
    } catch {
      console.error('Failed to load placement drives')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (driveId: string) => {
    if (!confirm('Are you sure you want to apply for this drive?')) return
    setActionLoading(driveId)
    setError(null)
    
    try {
      const res = await fetch('/api/student/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Applied successfully!')
      setTimeout(() => setToast(null), 3000)
      fetchDrives()
    } catch (err: any) {
      setError(err.message || 'Failed to apply')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Placement Drives
        </h1>
      </div>

      {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role & Package</th>
              <th className="p-4">Drive Date</th>
              <th className="p-4">Eligibility</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : drives.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No upcoming placement drives available.</td></tr>
            ) : drives.map(drive => {
              const application = drive.applications?.[0]
              const hasApplied = !!application

              return (
                <tr key={drive.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{drive.companyName}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{drive.role}</div>
                    <div className="text-xs text-green-600 font-bold">{drive.packageOffered}</div>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(drive.driveDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600 text-xs max-w-[200px]" title={drive.eligibilityCriteria}>
                    {drive.eligibilityCriteria}
                  </td>
                  <td className="p-4 text-center">
                    {hasApplied ? (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        application.status === 'OFFERED' ? 'bg-green-100 text-green-800' :
                        application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {application.status}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {hasApplied ? (
                      <button disabled className="text-gray-400 font-medium px-3 py-1 rounded bg-gray-50 border cursor-not-allowed">
                        Applied
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(drive.id)} 
                        disabled={actionLoading === drive.id}
                        className="text-white bg-blue-600 hover:bg-blue-700 font-medium px-3 py-1 rounded disabled:opacity-50"
                      >
                        {actionLoading === drive.id ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
