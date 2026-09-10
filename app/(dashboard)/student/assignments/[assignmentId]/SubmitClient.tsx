'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function SubmitClient({ assignment, submission }: { assignment: any, submission: any }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const isPastDue = new Date(assignment.dueDate) < new Date()

  // Generate accept string based on allowed types
  const acceptString = assignment.allowedFileTypes.map((type: string) => {
    if (type === 'pdf') return 'application/pdf'
    if (type === 'docx') return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (type === 'image') return 'image/*'
    if (type === 'zip') return '.zip,application/zip'
    if (type === 'code') return '.js,.py,.java,.cpp,.c,.html,.css,.json,text/plain'
    return ''
  }).filter(Boolean).join(',')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/student/assignments/${assignment.id}/submit`, {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit assignment')

      setToast('Assignment submitted successfully!')
      setFile(null)
      setTimeout(() => setToast(null), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 font-medium">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <Link href="/dashboard/student/assignments" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          &larr; Back to Assignments
        </Link>
        <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          {assignment.title}
        </h1>
        <p className="text-gray-600 text-lg">{assignment.course.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: 'var(--color-navy)' }}>Instructions</h2>
            <div className="prose text-gray-700 whitespace-pre-wrap">
              {assignment.description}
            </div>
            {assignment.rubric && (
              <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded text-blue-900 text-sm">
                <h3 className="font-bold mb-2 uppercase tracking-wide text-xs">Grading Rubric</h3>
                <p className="whitespace-pre-wrap">{assignment.rubric}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: 'var(--color-navy)' }}>Your Submission</h2>
            
            {submission && submission.grade ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">Graded</h3>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  {submission.grade.score} <span className="text-lg text-gray-500 font-normal">/ {assignment.maxMarks}</span>
                </div>
                {submission.grade.feedback && (
                  <div className="text-left bg-white p-4 rounded border text-sm text-gray-700">
                    <strong className="block mb-1">Feedback:</strong>
                    {submission.grade.feedback}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-4">
                  Graded by {submission.grade.gradedBy.name} on {new Date(submission.grade.gradedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div>
                {submission && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
                    <div>
                      <span className="font-bold text-blue-900 block mb-1">Current Submission (v{submission.version})</span>
                      <span className="text-sm text-blue-800">Submitted at: {new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">{submission.status}</span>
                  </div>
                )}

                {isPastDue ? (
                  <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded">
                    <strong>Due date has passed.</strong> Submissions are no longer accepted for this assignment.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded text-sm">{error}</div>}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload File <span className="text-gray-500 font-normal">(Max 20MB. Allowed: {assignment.allowedFileTypes.join(', ')})</span>
                      </label>
                      <input 
                        type="file" 
                        required
                        accept={acceptString}
                        onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading || !file}
                      className="btn-primary px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : submission ? 'Upload Resubmission' : 'Submit Assignment'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-navy)' }}>Details</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Due Date</span>
                <span className={`font-medium ${isPastDue ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(assignment.dueDate).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Max Marks</span>
                <span className="font-medium text-gray-900">{assignment.maxMarks}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Allowed Types</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignment.allowedFileTypes.map((t: string) => (
                    <span key={t} className="bg-white border px-2 py-1 rounded text-xs text-gray-600 uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Teacher</span>
                <span className="font-medium text-gray-900">{assignment.course.teacher.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
