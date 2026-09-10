'use client'

import { useState, useEffect } from 'react'

export function AllocationsClient({ students, rooms }: { students: any[], rooms: any[] }) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAllocateForm, setShowAllocateForm] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [roomId, setRoomId] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchAllocations()
  }, [])

  const fetchAllocations = async () => {
    try {
      const res = await fetch('/api/warden/allocations')
      const data = await res.json()
      if (res.ok) setAllocations(data.allocations)
    } catch {
      console.error('Failed to load allocations')
    } finally {
      setLoading(false)
    }
  }

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/warden/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, roomId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to allocate room')
      
      setShowAllocateForm(false)
      setToast('Student allocated successfully!')
      setTimeout(() => setToast(null), 3000)
      
      setStudentId(''); setRoomId('')
      fetchAllocations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleVacate = async (id: string) => {
    if (!confirm('Vacate student from this room?')) return
    try {
      const res = await fetch(`/api/warden/allocations/${id}/vacate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Room vacated')
      setTimeout(() => setToast(null), 3000)
      fetchAllocations()
    } catch (err: any) {
      alert(err.message)
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
          Hostel Allocations
        </h1>
        <button onClick={() => setShowAllocateForm(true)} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Allocate Student
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Room</th>
              <th className="p-4">Allocated At</th>
              <th className="p-4">Vacated At</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : allocations.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students are currently allocated.</td></tr>
            ) : allocations.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{a.student.name}</div>
                  <div className="text-xs text-gray-500">{a.student.email}</div>
                </td>
                <td className="p-4 font-medium">
                  Block {a.room.block} - {a.room.roomNumber}
                </td>
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
                <td className="p-4 text-right">
                  {!a.vacatedAt ? (
                    <button onClick={() => handleVacate(a.id)} className="text-red-600 font-medium hover:underline text-sm">Vacate</button>
                  ) : (
                    <span className="text-gray-400 text-sm">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAllocateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-md my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Allocate Room
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleAllocate} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Student</label>
                <select required value={studentId} onChange={e => setStudentId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Room</label>
                <select required value={roomId} onChange={e => setRoomId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Room...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Block {r.block} - {r.roomNumber} (Capacity: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowAllocateForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Allocating...' : 'Allocate Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
