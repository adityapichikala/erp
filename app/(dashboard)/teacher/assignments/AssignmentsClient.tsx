'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FILE_TYPES = [
  { id: 'pdf', label: 'PDF (.pdf)' },
  { id: 'docx', label: 'Word (.docx, .doc)' },
  { id: 'image', label: 'Images (.png, .jpg, .jpeg)' },
  { id: 'zip', label: 'Archive (.zip)' },
  { id: 'code', label: 'Code files (.js, .py, .java, etc.)' }
]

export function AssignmentsClient({ courses }: { courses: any[] }) {
  const router = useRouter()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [maxMarks, setMaxMarks] = useState('100')
  const [rubric, setRubric] = useState('')
  const [allowedTypes, setAllowedTypes] = useState<Set<string>>(new Set(['pdf']))
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/teacher/assignments')
      const data = await res.json()
      if (res.ok) setAssignments(data.assignments)
    } catch {
      console.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeToggle = (id: string) => {
    const newTypes = new Set(allowedTypes)
    if (newTypes.has(id)) newTypes.delete(id)
    else newTypes.add(id)
    setAllowedTypes(newTypes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (allowedTypes.size === 0) {
      setError('Please select at least one allowed file type')
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, title, description, dueDate, maxMarks, rubric,
          allowedFileTypes: Array.from(allowedTypes)
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create assignment')
      
      setShowForm(false)
      setToast('Assignment created successfully!')
      setTimeout(() => setToast(null), 3000)
      
      // Reset form
      setCourseId(''); setTitle(''); setDescription(''); setDueDate('');
      setRubric(''); setAllowedTypes(new Set(['pdf']))
      
      fetchAssignments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment? All submissions will be lost.')) return
    try {
      await fetch(`/api/teacher/assignments/${id}`, { method: 'DELETE' })
      setToast('Assignment deleted')
      setTimeout(() => setToast(null), 3000)
      fetchAssignments()
    } catch {
      alert('Failed to delete')
    }
  }

  // Group assignments by course
  const grouped = assignments.reduce((acc, curr) => {
    const code = curr.course.code
    if (!acc[code]) acc[code] = { courseName: curr.course.name, assignments: [] }
    acc[code].assignments.push(curr)
    return acc
  }, {} as Record<string, { courseName: string, assignments: any[] }>)

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Assignments
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Create Assignment
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading assignments...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white p-8 rounded border text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-gray-500 mb-4">You haven't created any assignments yet.</p>
          <button onClick={() => setShowForm(true)} className="text-blue-600 hover:underline">
            Create your first assignment
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(grouped).map(code => {
            const group = grouped[code]
            return (
            <div key={code} className="bg-white rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <div className="bg-gray-50 p-4 border-b">
                <h2 className="font-semibold text-lg" style={{ color: 'var(--color-navy)' }}>
                  {code} - {group.courseName}
                </h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Due Date</th>
                    <th className="p-4 font-medium">Max Marks</th>
                    <th className="p-4 font-medium text-center">Submissions</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.assignments.map((a: any) => {
                    const isPastDue = new Date(a.dueDate) < new Date()
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">
                          <Link href={`/dashboard/teacher/assignments/${a.id}`} className="hover:text-blue-600 hover:underline">
                            {a.title}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className={isPastDue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(a.dueDate).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{a.maxMarks}</td>
                        <td className="p-4 text-center">
                          <Link href={`/dashboard/teacher/assignments/${a.id}`} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200">
                            {a._count?.submissions || 0}
                          </Link>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <Link href={`/dashboard/teacher/assignments/${a.id}`} className="text-blue-600 hover:underline text-sm">View Submissions</Link>
                          <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-2xl my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Create Assignment
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label block font-medium mb-1">Course</label>
                  <select required value={courseId} onChange={e => setCourseId(e.target.value)} className="form-input w-full p-2 border rounded">
                    <option value="">Select Course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label block font-medium mb-1">Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. Midterm Report" />
                </div>
                <div className="col-span-2">
                  <label className="form-label block font-medium mb-1">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="form-input w-full p-2 border rounded" placeholder="Instructions for the students..."></textarea>
                </div>
                <div>
                  <label className="form-label block font-medium mb-1">Due Date & Time</label>
                  <input type="datetime-local" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="form-label block font-medium mb-1">Max Marks</label>
                  <input type="number" required value={maxMarks} onChange={e => setMaxMarks(e.target.value)} min="1" className="form-input w-full p-2 border rounded" />
                </div>
                <div className="col-span-2">
                  <label className="form-label block font-medium mb-1">Rubric (Optional)</label>
                  <textarea value={rubric} onChange={e => setRubric(e.target.value)} rows={2} className="form-input w-full p-2 border rounded" placeholder="Grading criteria..."></textarea>
                </div>
                <div className="col-span-2">
                  <label className="form-label block font-medium mb-2">Allowed File Types</label>
                  <div className="flex flex-wrap gap-4">
                    {FILE_TYPES.map(type => (
                      <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={allowedTypes.has(type.id)}
                          onChange={() => handleTypeToggle(type.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
