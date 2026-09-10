'use client'

import { useState } from 'react'
import { getEnrolledStudentsForAttendance, saveAttendance } from './actions'

interface Course {
  id: string
  name: string
  code: string
}

interface StudentRecord {
  id: string
  name: string
  email: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | null
}

export function AttendanceClient({ courses }: { courses: Course[] }) {
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleFetchStudents = async () => {
    if (!selectedCourse || !selectedDate) return
    
    setIsLoading(true)
    setMessage(null)
    try {
      const data = await getEnrolledStudentsForAttendance(selectedCourse, selectedDate)
      setStudents(data)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s))
  }

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    setStudents(prev => prev.map(s => ({ ...s, status })))
  }

  const handleSave = async () => {
    // Only save students that have a status selected
    const recordsToSave = students
      .filter(s => s.status !== null)
      .map(s => ({ studentId: s.id, status: s.status as string }))

    if (recordsToSave.length === 0) {
      setMessage({ type: 'error', text: 'No attendance marked yet.' })
      return
    }

    setIsSaving(true)
    setMessage(null)
    try {
      await saveAttendance(selectedCourse, selectedDate, recordsToSave)
      setMessage({ type: 'success', text: 'Attendance saved successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-end" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex-1">
          <label className="form-label">Course</label>
          <select 
            className="form-input" 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="form-label">Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <button 
          onClick={handleFetchStudents} 
          disabled={!selectedCourse || !selectedDate || isLoading}
          className="btn-primary whitespace-nowrap"
        >
          {isLoading ? 'Loading...' : 'Fetch Roster'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF1F2] text-[#BE123C]'}`}>
          {message.text}
        </div>
      )}

      {/* Roster Table */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-4 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold text-gray-800">Enrolled Students ({students.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => markAll('PRESENT')} className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5] transition-colors">
                Mark All Present
              </button>
              <button onClick={() => markAll('ABSENT')} className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#FFF1F2] text-[#BE123C] hover:bg-[#FEE2E2] transition-colors">
                Mark All Absent
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="font-mono text-sm">{student.email.split('@')[0]}</td>
                    <td className="font-medium">{student.name}</td>
                    <td>
                      <div className="flex gap-2">
                        <StatusButton 
                          active={student.status === 'PRESENT'} 
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          color="success"
                          label="Present"
                        />
                        <StatusButton 
                          active={student.status === 'LATE'} 
                          onClick={() => handleStatusChange(student.id, 'LATE')}
                          color="warning"
                          label="Late"
                        />
                        <StatusButton 
                          active={student.status === 'ABSENT'} 
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          color="error"
                          label="Absent"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end" style={{ borderColor: 'var(--color-border)' }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusButton({ active, onClick, color, label }: { active: boolean, onClick: () => void, color: 'success' | 'warning' | 'error', label: string }) {
  const baseClasses = "px-3 py-1 text-xs font-bold rounded-full transition-all border"
  
  let colorClasses = ""
  if (color === 'success') {
    colorClasses = active ? "bg-[#10B981] text-white border-[#10B981]" : "bg-white text-gray-500 border-gray-200 hover:border-[#10B981] hover:text-[#10B981]"
  } else if (color === 'warning') {
    colorClasses = active ? "bg-[#F59E0B] text-white border-[#F59E0B]" : "bg-white text-gray-500 border-gray-200 hover:border-[#F59E0B] hover:text-[#F59E0B]"
  } else if (color === 'error') {
    colorClasses = active ? "bg-[#F43F5E] text-white border-[#F43F5E]" : "bg-white text-gray-500 border-gray-200 hover:border-[#F43F5E] hover:text-[#F43F5E]"
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${colorClasses}`}>
      {label}
    </button>
  )
}
