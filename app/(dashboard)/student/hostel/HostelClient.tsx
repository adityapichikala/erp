'use client'

import { useState, useEffect } from 'react'

export function HostelClient() {
  const [allocations, setAllocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/hostel')
      .then(res => res.json())
      .then(data => {
        setAllocations(data.allocations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Hostel Allocations
        </h1>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Block</th>
              <th className="p-4">Room Number</th>
              <th className="p-4">Allocated At</th>
              <th className="p-4">Vacated At</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : allocations.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">You do not have any hostel allocations.</td></tr>
            ) : allocations.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{a.room.block}</td>
                <td className="p-4">{a.room.roomNumber}</td>
                <td className="p-4 text-gray-600">{new Date(a.allocatedAt).toLocaleDateString()}</td>
                <td className="p-4 text-gray-600">
                  {a.vacatedAt ? new Date(a.vacatedAt).toLocaleDateString() : '-'}
                </td>
                <td className="p-4 text-center">
                  {!a.vacatedAt ? (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-800">Vacated</span>
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
