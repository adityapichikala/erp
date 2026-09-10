'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ClassesClient({ classes, departments, students }: { classes: any[], departments: any[], students: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<any | null>(null)
  
  const [name, setName] = useState('')
  const [deptId, setDeptId] = useState('')
  const [semester, setSemester] = useState('1')
  const [batchYear, setBatchYear] = useState(new Date().getFullYear().toString())
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Bulk Enroll state
  const [enrollingClass, setEnrollingClass] = useState<any | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  const openForm = (classRec?: any) => {
    if (classRec) {
      setEditingClass(classRec)
      setName(classRec.name)
      setDeptId(classRec.departmentId)
      setSemester(classRec.semester.toString())
      setBatchYear(classRec.batchYear.toString())
    } else {
      setEditingClass(null)
      setName('')
      setDeptId('')
      setSemester('1')
      setBatchYear(new Date().getFullYear().toString())
    }
    setShowForm(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const url = editingClass ? `/api/admin/classes/${editingClass.id}` : '/api/admin/classes'
    const method = editingClass ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, departmentId: deptId, semester, batchYear })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
      } else {
        setShowForm(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    try {
      await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      alert('Failed to delete')
    }
  }

  const handleBulkEnroll = async () => {
    if (selectedStudents.size === 0) return
    setEnrollLoading(true)
    setEnrollError(null)

    try {
      const res = await fetch(`/api/admin/classes/${enrollingClass.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: Array.from(selectedStudents) })
      })

      const data = await res.json()
      if (!res.ok) {
        setEnrollError(data.error || 'Failed to enroll')
      } else {
        alert(`Successfully enrolled ${data.count} student(s) into class courses!`)
        setEnrollingClass(null)
        setSelectedStudents(new Set())
        router.refresh()
      }
    } catch (err: any) {
      setEnrollError(err.message)
    } finally {
      setEnrollLoading(false)
    }
  }

  const toggleStudentSelection = (id: string) => {
    const newSet = new Set(selectedStudents)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedStudents(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
    }
  }

  // Only show students matching the department of the class being enrolled
  const filteredStudents = enrollingClass 
    ? students.filter(s => s.departmentId === enrollingClass.departmentId)
    : []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Classes Management
        </h1>
        <button onClick={() => openForm()} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Add Class
        </button>
      </div>

      <div className="bg-white rounded overflow-x-auto border" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Class Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Semester</th>
              <th className="p-3">Batch Year</th>
              <th className="p-3">Students Enrolled</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No classes found.</td></tr>
            ) : classes.map(cls => (
              <tr key={cls.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{cls.name}</td>
                <td className="p-3 text-gray-600">{cls.department?.name}</td>
                <td className="p-3 text-gray-600">{cls.semester}</td>
                <td className="p-3 text-gray-600">{cls.batchYear}</td>
                <td className="p-3 text-gray-600">{cls.studentCount || 0}</td>
                <td className="p-3 text-right space-x-3">
                  <button onClick={() => setEnrollingClass(cls)} className="text-green-600 hover:underline font-semibold">Bulk Enroll</button>
                  <button onClick={() => openForm(cls)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              {editingClass ? 'Edit Class' : 'Create Class'}
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label block text-sm font-medium mb-1">Class Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. CS Section A" />
              </div>
              <div>
                <label className="form-label block text-sm font-medium mb-1">Department</label>
                <select required value={deptId} onChange={e => setDeptId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="form-label block text-sm font-medium mb-1">Semester</label>
                  <input type="number" required value={semester} onChange={e => setSemester(e.target.value)} className="form-input w-full p-2 border rounded" min="1" max="10" />
                </div>
                <div className="flex-1">
                  <label className="form-label block text-sm font-medium mb-1">Batch Year</label>
                  <input type="number" required value={batchYear} onChange={e => setBatchYear(e.target.value)} className="form-input w-full p-2 border rounded" min="2000" max="2100" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {enrollingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-2xl mt-10 mb-10" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Bulk Enroll Students in {enrollingClass.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Select students to enroll. They will be added to all courses currently scheduled for this class in the timetable.
            </p>

            {enrollError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{enrollError}</div>}

            <div className="border rounded max-h-96 overflow-y-auto mb-4">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-2 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll}
                        checked={filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length}
                      />
                    </th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">No active students found in this department.</td></tr>
                  ) : filteredStudents.map(student => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.has(student.id)} 
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                      </td>
                      <td className="p-2">{student.name}</td>
                      <td className="p-2 text-gray-500">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{selectedStudents.size} selected</span>
              <div className="flex gap-2">
                <button onClick={() => { setEnrollingClass(null); setSelectedStudents(new Set()); }} className="btn-secondary px-4 py-2 border rounded">
                  Cancel
                </button>
                <button 
                  onClick={handleBulkEnroll} 
                  disabled={enrollLoading || selectedStudents.size === 0} 
                  className="btn-primary px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {enrollLoading ? 'Enrolling...' : 'Enroll Selected'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
