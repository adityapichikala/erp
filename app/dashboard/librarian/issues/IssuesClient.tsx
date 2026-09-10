'use client'

import { useState, useEffect } from 'react'

export function IssuesClient({ students, books }: { students: any[], books: any[] }) {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [itemId, setItemId] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/librarian/issues')
      const data = await res.json()
      if (res.ok) setIssues(data.issues)
    } catch {
      console.error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/librarian/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, itemId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to issue book')
      
      setShowIssueForm(false)
      setToast('Book issued successfully!')
      setTimeout(() => setToast(null), 3000)
      
      setStudentId(''); setItemId('')
      fetchIssues()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleReturn = async (id: string) => {
    if (!confirm('Process return for this book? Fines will be computed automatically.')) return
    try {
      const res = await fetch(`/api/librarian/issues/${id}/return`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Book returned successfully')
      setTimeout(() => setToast(null), 3000)
      fetchIssues()
    } catch (err: any) {
      alert(err.message)
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
          Library Issues
        </h1>
        <button onClick={() => setShowIssueForm(true)} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Issue Book
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Book Title</th>
              <th className="p-4">Issued At</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Returned At</th>
              <th className="p-4 text-center">Fine</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : issues.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No books have been issued yet.</td></tr>
            ) : issues.map(issue => (
              <tr key={issue.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{issue.student.name}</div>
                  <div className="text-xs text-gray-500">{issue.student.email}</div>
                </td>
                <td className="p-4 font-medium">{issue.item.title}</td>
                <td className="p-4 text-gray-600">{new Date(issue.issuedAt).toLocaleDateString()}</td>
                <td className="p-4 text-gray-600">
                  {new Date(issue.dueAt).toLocaleDateString()}
                  {!issue.returnedAt && new Date() > new Date(issue.dueAt) && (
                    <span className="ml-2 text-xs font-bold text-red-600 px-1 bg-red-100 rounded">Overdue</span>
                  )}
                </td>
                <td className="p-4 text-gray-600">
                  {issue.returnedAt ? new Date(issue.returnedAt).toLocaleDateString() : '-'}
                </td>
                <td className="p-4 text-center">
                  {issue.fineAmount > 0 ? (
                    <span className="text-red-600 font-bold">${issue.fineAmount.toFixed(2)}</span>
                  ) : issue.returnedAt ? (
                    <span className="text-green-600">$0.00</span>
                  ) : '-'}
                </td>
                <td className="p-4 text-right">
                  {!issue.returnedAt ? (
                    <button onClick={() => handleReturn(issue.id)} className="text-blue-600 font-medium hover:underline text-sm">Return</button>
                  ) : (
                    <span className="text-gray-400 text-sm">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-md my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Issue a Book
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleIssue} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Student</label>
                <select required value={studentId} onChange={e => setStudentId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Book</label>
                <select required value={itemId} onChange={e => setItemId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Book...</option>
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} (Available: {b.availableCopies})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowIssueForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Issuing...' : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
