'use client'

import { useState, useEffect } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TimetableClient({ classes, courses }: { classes: any[], courses: any[] }) {
  const [classId, setClassId] = useState('')
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Add Slot Form State
  const [courseId, setCourseId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [room, setRoom] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    if (classId) {
      fetchSlots()
    } else {
      setSlots([])
    }
  }, [classId])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/timetable?classId=${classId}`)
      const data = await res.json()
      if (res.ok) setSlots(data.slots)
    } catch {
      alert('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)

    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, classId, dayOfWeek, startTime, endTime, room })
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || 'Conflict detected')
      } else {
        setCourseId('')
        setRoom('')
        fetchSlots()
      }
    } catch (err: any) {
      setAddError(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Delete this slot?')) return
    try {
      await fetch(`/api/admin/timetable/${id}`, { method: 'DELETE' })
      fetchSlots()
    } catch {
      alert('Failed to delete slot')
    }
  }

  const filteredCourses = classId 
    ? courses.filter(c => c.departmentId === classes.find(cls => cls.id === classId)?.departmentId)
    : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Timetable Builder
        </h1>
        
        <div className="bg-white p-4 rounded border flex items-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <label className="font-medium text-sm">Select Class:</label>
          <select 
            value={classId} 
            onChange={e => setClassId(e.target.value)} 
            className="form-input p-2 border rounded min-w-[250px]"
          >
            <option value="">-- Choose a Class --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {classId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white p-4 rounded border h-fit" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Add New Slot
            </h2>
            {addError && <div className="mb-4 text-xs text-red-600 bg-red-50 p-2 rounded">{addError}</div>}
            
            <form onSubmit={handleAddSlot} className="space-y-3 text-sm">
              <div>
                <label className="block mb-1 font-medium">Course</label>
                <select required value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">Select Course...</option>
                  {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Day</label>
                <select required value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} className="w-full p-2 border rounded">
                  {DAYS.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Start</label>
                  <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">End</label>
                  <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Room</label>
                <input type="text" required value={room} onChange={e => setRoom(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 101A" />
              </div>
              <button type="submit" disabled={addLoading} className="w-full btn-primary bg-blue-600 text-white p-2 rounded mt-2">
                {addLoading ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-3 bg-white p-4 rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
            {loading ? (
              <p className="text-gray-500">Loading timetable...</p>
            ) : (
              <div className="min-w-[800px]">
                {DAYS.map((day, dayIndex) => {
                  const daySlots = slots.filter(s => s.dayOfWeek === dayIndex)
                  if (daySlots.length === 0) return null
                  
                  return (
                    <div key={dayIndex} className="mb-6 last:mb-0">
                      <h3 className="font-medium bg-gray-100 p-2 rounded mb-2 border">{day}</h3>
                      <div className="flex gap-3 flex-wrap">
                        {daySlots.map(slot => (
                          <div key={slot.id} className="border p-3 rounded bg-blue-50 relative min-w-[200px] border-blue-100">
                            <button 
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
                              title="Delete slot"
                            >
                              ✕
                            </button>
                            <div className="font-semibold text-blue-900">{slot.course.code}</div>
                            <div className="text-xs text-blue-800">{slot.course.name}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              🕒 {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-xs text-gray-600">
                              📍 {slot.room} | 👨‍🏫 {slot.course.teacher?.name || 'TBD'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {slots.length === 0 && <p className="text-gray-500">No timetable slots found for this class.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
