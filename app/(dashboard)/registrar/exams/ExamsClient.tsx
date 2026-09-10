'use client'

import { useState, useEffect } from 'react'

export function ExamsClient({ courses }: { courses: any[] }) {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [examDate, setExamDate] = useState('')
  const [examType, setExamType] = useState('MIDTERM')
  const [maxMarks, setMaxMarks] = useState('100')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/registrar/exams')
      const data = await res.json()
      if (res.ok) setExams(data.exams)
    } catch {
      console.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/registrar/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, examDate, examType, maxMarks })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create exam')
      
      setShowForm(false)
      setToast('Exam created successfully!')
      setTimeout(() => setToast(null), 3000)
      
      // Reset form
      setCourseId(''); setExamDate(''); setExamType('MIDTERM'); setMaxMarks('100')
      fetchExams()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? All results will be lost.')) return
    try {
      await fetch(`/api/registrar/exams/${id}`, { method: 'DELETE' })
      setToast('Exam deleted')
      setTimeout(() => setToast(null), 3000)
      fetchExams()
    } catch {
      alert('Failed to delete')
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
          Manage Examinations
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Create Exam
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Course</th>
              <th className="p-4">Exam Type</th>
              <th className="p-4">Exam Date</th>
              <th className="p-4">Max Marks</th>
              <th className="p-4 text-center">Results Entered</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : exams.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No exams scheduled yet.</td></tr>
            ) : exams.map(exam => (
              <tr key={exam.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{exam.course.name}</div>
                  <div className="text-xs text-gray-500">{exam.course.code} | {exam.course.department?.name}</div>
                </td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase">
                    {exam.examType}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{new Date(exam.examDate).toLocaleDateString()}</td>
                <td className="p-4 font-medium text-gray-900">{exam.maxMarks}</td>
                <td className="p-4 text-center">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {exam._count?.results || 0}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-md my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Schedule Exam
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Course</label>
                <select required value={courseId} onChange={e => setCourseId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Exam Type</label>
                <select required value={examType} onChange={e => setExamType(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="MIDTERM">Midterm</option>
                  <option value="FINAL">Final</option>
                  <option value="QUIZ">Quiz</option>
                </select>
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Exam Date</label>
                <input type="date" required value={examDate} onChange={e => setExamDate(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Max Marks</label>
                <input type="number" required value={maxMarks} onChange={e => setMaxMarks(e.target.value)} min="1" className="form-input w-full p-2 border rounded" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
