'use client'

import { useState, useEffect } from 'react'

export function AttendanceMarker({ courses }: { courses: any[] }) {
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [roster, setRoster] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (courseId && date) {
      fetchRoster()
    } else {
      setRoster([])
    }
  }, [courseId, date])

  const fetchRoster = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch(`/api/teacher/attendance?courseId=${courseId}&date=${date}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load roster')
      
      // Map roster and default null status to empty string for UI
      setRoster(data.roster.map((r: any) => ({ ...r, status: r.status || '' })))
    } catch (err: any) {
      setError(err.message)
      setRoster([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setRoster(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r))
    setSuccess(false)
  }

  const handleSave = async () => {
    // Filter out unselected statuses to only save explicit marks
    const recordsToSave = roster.filter(r => r.status !== '').map(r => ({
      studentId: r.studentId,
      status: r.status
    }))

    if (recordsToSave.length === 0) {
      setError('No attendance marked to save.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, date, records: recordsToSave })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const markAll = (status: string) => {
    setRoster(prev => prev.map(r => ({ ...r, status })))
    setSuccess(false)
  }

  // Calculate stats
  const presentCount = roster.filter(r => r.status === 'PRESENT').length
  const absentCount = roster.filter(r => r.status === 'ABSENT').length
  const lateCount = roster.filter(r => r.status === 'LATE').length
  const unmarkedCount = roster.filter(r => r.status === '').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Mark Attendance
        </h1>
        
        <div className="bg-white p-4 rounded border flex flex-wrap items-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <label className="font-medium text-sm block mb-1">Course:</label>
            <select 
              value={courseId} 
              onChange={e => setCourseId(e.target.value)} 
              className="form-input p-2 border rounded min-w-[250px]"
            >
              <option value="">-- Select Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium text-sm block mb-1">Date:</label>
            <input 
              type="date" 
              value={date} 
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              onChange={e => setDate(e.target.value)} 
              className="form-input p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">Attendance saved successfully!</div>}

      {courseId && date && (
        <div className="bg-white rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          {loading ? (
            <div className="p-6 text-gray-500 text-center">Loading roster...</div>
          ) : roster.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">No students enrolled in this course.</div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-4 text-sm font-medium">
                  <span className="text-green-600">Present: {presentCount}</span>
                  <span className="text-red-600">Absent: {absentCount}</span>
                  <span className="text-orange-500">Late: {lateCount}</span>
                  <span className="text-gray-500">Unmarked: {unmarkedCount}</span>
                </div>
                <div className="space-x-2">
                  <button onClick={() => markAll('PRESENT')} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Mark All Present</button>
                  <button onClick={() => markAll('ABSENT')} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Mark All Absent</button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left text-sm relative">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map(student => (
                      <tr key={student.studentId} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{student.name}</td>
                        <td className="p-3 text-gray-500">{student.email}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                              className={`px-3 py-1 text-xs rounded font-medium border ${
                                student.status === 'PRESENT' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                              className={`px-3 py-1 text-xs rounded font-medium border ${
                                student.status === 'ABSENT' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.studentId, 'LATE')}
                              className={`px-3 py-1 text-xs rounded font-medium border ${
                                student.status === 'LATE' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t text-right sticky bottom-0">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="btn-primary px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
