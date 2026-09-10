'use client'

import { useState, useEffect } from 'react'

export function RoomsClient() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [block, setBlock] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/warden/rooms')
      const data = await res.json()
      if (res.ok) setRooms(data.rooms)
    } catch {
      console.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (room: any) => {
    setEditId(room.id)
    setBlock(room.block)
    setRoomNumber(room.roomNumber)
    setCapacity(room.capacity.toString())
    setShowForm(true)
    setError(null)
  }

  const handleAdd = () => {
    setEditId(null)
    setBlock('')
    setRoomNumber('')
    setCapacity('')
    setShowForm(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const url = editId ? `/api/warden/rooms/${editId}` : '/api/warden/rooms'
      const method = editId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block, roomNumber, capacity })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save room')
      
      setShowForm(false)
      setToast(editId ? 'Room updated!' : 'Room added!')
      setTimeout(() => setToast(null), 3000)
      
      fetchRooms()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    try {
      const res = await fetch(`/api/warden/rooms/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Room deleted')
      setTimeout(() => setToast(null), 3000)
      fetchRooms()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
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
          Hostel Rooms
        </h1>
        <button onClick={handleAdd} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Add Room
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Block</th>
              <th className="p-4">Room Number</th>
              <th className="p-4 text-center">Capacity</th>
              <th className="p-4 text-center">Occupied</th>
              <th className="p-4 text-center">Availability</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No rooms in the hostel.</td></tr>
            ) : rooms.map(room => {
              const occupied = room._count?.allocations || 0
              const isFull = occupied >= room.capacity
              
              return (
                <tr key={room.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{room.block}</td>
                  <td className="p-4">{room.roomNumber}</td>
                  <td className="p-4 text-center">{room.capacity}</td>
                  <td className="p-4 text-center font-semibold">{occupied}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {isFull ? 'Full' : `${room.capacity - occupied} Available`}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => handleEdit(room)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-md my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              {editId ? 'Edit Room' : 'Add Room'}
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Block / Wing</label>
                <input type="text" required value={block} onChange={e => setBlock(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. Block A" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Room Number</label>
                <input type="text" required value={roomNumber} onChange={e => setRoomNumber(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. 101" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Capacity</label>
                <input type="number" required min="1" value={capacity} onChange={e => setCapacity(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Saving...' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
