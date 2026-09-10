'use client'

import { useState, useEffect } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TimetableViewer({ title }: { title: string }) {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/timetable')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load timetable')
        return res.json()
      })
      .then(data => {
        setSlots(data.slots || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-6">Loading timetable...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          {title}
        </h1>
      </div>

      <div className="bg-white p-6 rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <div className="min-w-[800px]">
          {DAYS.map((day, dayIndex) => {
            const daySlots = slots.filter(s => s.dayOfWeek === dayIndex)
            if (daySlots.length === 0) return null
            
            return (
              <div key={dayIndex} className="mb-6 last:mb-0">
                <h3 className="font-medium bg-gray-100 p-2 rounded mb-3 border">{day}</h3>
                <div className="flex gap-4 flex-wrap">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="border p-4 rounded bg-blue-50 relative min-w-[220px] shadow-sm border-blue-100">
                      <div className="font-bold text-blue-900">{slot.course.code}</div>
                      <div className="text-sm font-medium text-blue-800 mb-2">{slot.course.name}</div>
                      <div className="text-sm text-gray-700">
                        🕒 {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        📍 {slot.room}
                      </div>
                      {slot.class && (
                        <div className="text-xs text-gray-500 mt-2 bg-white px-2 py-1 inline-block rounded">
                          Class: {slot.class.name}
                        </div>
                      )}
                      {slot.course.teacher && (
                        <div className="text-xs text-gray-500 mt-1 bg-white px-2 py-1 inline-block rounded">
                          Prof: {slot.course.teacher.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {slots.length === 0 && <p className="text-gray-500">No classes scheduled yet.</p>}
        </div>
      </div>
    </div>
  )
}
