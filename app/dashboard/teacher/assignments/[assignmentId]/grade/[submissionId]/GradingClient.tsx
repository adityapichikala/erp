'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function GradingClient({ 
  assignmentId, 
  submissionId, 
  assignment, 
  submission, 
  fileUrl 
}: { 
  assignmentId: string, 
  submissionId: string, 
  assignment: any, 
  submission: any,
  fileUrl: string 
}) {
  const router = useRouter()
  
  // Grade state
  const [score, setScore] = useState(submission.grade?.score?.toString() || '')
  const [feedback, setFeedback] = useState(submission.grade?.feedback || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/teacher/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, feedback })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save grade')

      setToast('Grade saved successfully!')
      setTimeout(() => setToast(null), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Determine how to render the file preview based on path extension
  // In a real app we'd store the MIME type or parse the signed URL, but we can guess from extension
  const isImage = fileUrl.toLowerCase().includes('.png') || fileUrl.toLowerCase().includes('.jpg') || fileUrl.toLowerCase().includes('.jpeg')
  const isPdf = fileUrl.toLowerCase().includes('.pdf')

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 font-medium">
          {toast}
        </div>
      )}

      <div className="mb-4">
        <Link href={`/dashboard/teacher/assignments/${assignmentId}`} className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          &larr; Back to Submissions
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Grading: {submission.student.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Assignment: {assignment.title} | Submitted: {new Date(submission.submittedAt).toLocaleString()} | Status: {submission.status}
            </p>
          </div>
          {submission.grade && (
            <div className="text-right text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                Current Score: {submission.grade.score} / {assignment.maxMarks}
              </span>
              <div className="text-gray-500 mt-2 text-xs">
                Graded by {submission.grade.gradedBy.name} on {new Date(submission.grade.gradedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Side: Preview */}
        <div className="flex-1 bg-white rounded border flex flex-col overflow-hidden shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
          <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
            <span className="font-medium text-sm text-gray-700">Submission Preview</span>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline bg-white px-2 py-1 border rounded">
              Open in New Tab
            </a>
          </div>
          <div className="flex-1 bg-gray-100 overflow-auto relative flex items-center justify-center">
            {isPdf ? (
              <iframe src={fileUrl} className="w-full h-full border-0" title="PDF Preview" />
            ) : isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl} alt="Submission Preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center p-8">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
                <a href={fileUrl} download className="btn-primary px-4 py-2 bg-blue-600 text-white rounded">
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Grading Form */}
        <div className="w-96 bg-white rounded border flex flex-col overflow-hidden shadow-sm flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="bg-gray-50 p-4 border-b">
            <h2 className="font-semibold" style={{ color: 'var(--color-navy)' }}>Grade & Feedback</h2>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {assignment.rubric && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900">
                <h3 className="font-bold mb-1 text-xs uppercase tracking-wider text-blue-800">Rubric</h3>
                <p className="whitespace-pre-wrap">{assignment.rubric}</p>
              </div>
            )}

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Score (Out of {assignment.maxMarks})</label>
                <input 
                  type="number" 
                  step="0.5"
                  required 
                  min="0" 
                  max={assignment.maxMarks}
                  value={score} 
                  onChange={e => setScore(e.target.value)} 
                  className="form-input w-full p-2 border rounded text-lg font-bold" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <textarea 
                  rows={6} 
                  value={feedback} 
                  onChange={e => setFeedback(e.target.value)} 
                  className="form-input w-full p-2 border rounded" 
                  placeholder="Provide constructive feedback..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full btn-primary px-4 py-3 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : submission.grade ? 'Update Grade' : 'Save Grade'}
              </button>
            </form>

            {submission.grade?.history && Array.isArray(submission.grade.history) && submission.grade.history.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium text-sm text-gray-500 mb-3">Revision History</h3>
                <div className="space-y-3">
                  {submission.grade.history.map((h: any, i: number) => (
                    <div key={i} className="text-xs bg-gray-50 p-2 rounded border">
                      <div className="flex justify-between font-medium text-gray-700 mb-1">
                        <span>Score: {h.score}</span>
                        <span>{new Date(h.gradedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 truncate">{h.feedback || 'No feedback'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
