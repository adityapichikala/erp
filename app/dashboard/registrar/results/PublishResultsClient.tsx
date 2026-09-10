'use client'

import { useState, useEffect } from 'react'

export function PublishResultsClient() {
  const [summary, setSummary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/registrar/results')
      const data = await res.json()
      if (res.ok) setSummary(data.summary)
    } catch {
      setError('Failed to load results summary')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (examId: string) => {
    if (!confirm('Are you sure? Once published, results are visible to students and cannot be modified.')) return
    
    setPublishing(examId)
    setError(null)
    try {
      const res = await fetch(`/api/registrar/results/${examId}/publish`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish')
      
      setToast('Results published successfully!')
      setTimeout(() => setToast(null), 3000)
      fetchSummary()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setPublishing(null)
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 font-medium">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Publish Results
        </h1>
        <p className="text-gray-600">Review entered marks and publish them to student dashboards.</p>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Exam Details</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Marks Entered</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading summary...</td></tr>
            ) : summary.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No exams scheduled yet.</td></tr>
            ) : summary.map(exam => (
              <tr key={exam.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{exam.course.name}</div>
                  <div className="text-xs text-gray-500">{exam.course.code} | {exam.examType}</div>
                </td>
                <td className="p-4 text-gray-600">{new Date(exam.examDate).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    exam.totalEntered === exam.totalEnrolled && exam.totalEnrolled > 0 ? 'bg-green-100 text-green-800' : 
                    exam.totalEntered > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {exam.totalEntered} / {exam.totalEnrolled}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {exam.isPublished ? (
                    <span className="text-green-600 font-semibold uppercase text-xs">Published</span>
                  ) : exam.totalEntered > 0 ? (
                    <span className="text-orange-500 font-semibold uppercase text-xs">Pending Review</span>
                  ) : (
                    <span className="text-gray-400 uppercase text-xs">Awaiting Marks</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {exam.readyToPublish ? (
                    <button 
                      onClick={() => handlePublish(exam.id)}
                      disabled={publishing === exam.id}
                      className="btn-primary px-4 py-2 bg-blue-600 text-white rounded font-medium text-xs disabled:opacity-50"
                    >
                      {publishing === exam.id ? 'Publishing...' : 'Publish Results'}
                    </button>
                  ) : (
                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded font-medium text-xs cursor-not-allowed">
                      {exam.isPublished ? 'Published' : 'Publish Results'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
