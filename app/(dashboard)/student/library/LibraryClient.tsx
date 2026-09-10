'use client'

import { useState, useEffect } from 'react'

export function LibraryClient() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/library')
      .then(res => res.json())
      .then(data => {
        setIssues(data.issues || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Library Books
        </h1>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Book Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Issued At</th>
              <th className="p-4">Due Date</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Fine Paid</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : issues.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No books have been issued to you.</td></tr>
            ) : issues.map(issue => {
              const isOverdue = !issue.returnedAt && new Date() > new Date(issue.dueAt)
              
              return (
                <tr key={issue.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{issue.item.title}</td>
                  <td className="p-4 text-gray-600">{issue.item.author}</td>
                  <td className="p-4 text-gray-600">{new Date(issue.issuedAt).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(issue.dueAt).toLocaleDateString()}
                    {isOverdue && (
                      <span className="ml-2 text-xs font-bold text-red-600 px-1 bg-red-100 rounded">Overdue</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {issue.returnedAt ? (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">Returned</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800">Issued</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {issue.returnedAt ? (
                      issue.fineAmount > 0 ? (
                        <span className="text-red-600 font-bold">${issue.fineAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">$0.00</span>
                      )
                    ) : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
