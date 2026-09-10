'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CoursesClient({ courses, departments, teachers }: { courses: any[], departments: any[], teachers: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [deptId, setDeptId] = useState('')
  const [credits, setCredits] = useState('3')
  const [teacherId, setTeacherId] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openForm = (course?: any) => {
    if (course) {
      setEditingCourse(course)
      setName(course.name)
      setCode(course.code)
      setDeptId(course.departmentId)
      setCredits(course.credits.toString())
      setTeacherId(course.teacherId || '')
    } else {
      setEditingCourse(null)
      setName('')
      setCode('')
      setDeptId('')
      setCredits('3')
      setTeacherId('')
    }
    setShowForm(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses'
    const method = editingCourse ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, departmentId: deptId, credits, teacherId })
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
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      alert('Failed to delete')
    }
  }

  // Filter teachers by selected department
  const filteredTeachers = teachers.filter(t => t.departmentId === deptId)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Courses Management
        </h1>
        <button onClick={() => openForm()} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Add Course
        </button>
      </div>

      <div className="bg-white rounded overflow-x-auto border" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Credits</th>
              <th className="p-3">Teacher</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No courses found.</td></tr>
            ) : courses.map(course => (
              <tr key={course.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 font-mono text-gray-700">{course.code}</td>
                <td className="p-3 font-medium text-gray-900">{course.name}</td>
                <td className="p-3 text-gray-600">{course.department?.name}</td>
                <td className="p-3 text-gray-600">{course.credits}</td>
                <td className="p-3 text-gray-600">{course.teacher?.name || <span className="text-gray-400 text-xs italic">Unassigned</span>}</td>
                <td className="p-3 text-right space-x-3">
                  <button onClick={() => openForm(course)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:underline">Delete</button>
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
              {editingCourse ? 'Edit Course' : 'Create Course'}
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label block text-sm font-medium mb-1">Course Code</label>
                <input required value={code} onChange={e => setCode(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. CS101" />
              </div>
              <div>
                <label className="form-label block text-sm font-medium mb-1">Course Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block text-sm font-medium mb-1">Department</label>
                <select required value={deptId} onChange={e => { setDeptId(e.target.value); setTeacherId(''); }} className="form-input w-full p-2 border rounded">
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label block text-sm font-medium mb-1">Credits</label>
                <input type="number" required value={credits} onChange={e => setCredits(e.target.value)} className="form-input w-full p-2 border rounded" min="1" max="10" />
              </div>
              <div>
                <label className="form-label block text-sm font-medium mb-1">Assign Teacher</label>
                <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="form-input w-full p-2 border rounded" disabled={!deptId}>
                  <option value="">None / Unassigned</option>
                  {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
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
    </div>
  )
}
