'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function SubmissionsClient({ assignmentId, assignment }: { assignmentId: string, assignment: any }) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/teacher/assignments/${assignmentId}/submissions`)
      .then(res => res.json())
      .then(data => {
        setList(data.list || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [assignmentId])

  if (loading) return <div className="text-gray-500">Loading submissions...</div>

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/dashboard/teacher/assignments" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            &larr; Back to Assignments
          </Link>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
            {assignment.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Due: {new Date(assignment.dueDate).toLocaleString()} | Max Marks: {assignment.maxMarks}</p>
        </div>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Submitted At</th>
              <th className="p-4">Status</th>
              <th className="p-4">Grade</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students enrolled in this course.</td></tr>
            ) : list.map((item) => {
              const sub = item.submission
              return (
                <tr key={item.studentId} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{item.studentName}</td>
                  <td className="p-4 text-gray-500">{item.studentEmail}</td>
                  <td className="p-4 text-gray-600">
                    {sub ? new Date(sub.submittedAt).toLocaleString() : <span className="text-gray-400 italic">Not submitted</span>}
                  </td>
                  <td className="p-4">
                    {sub ? (
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        sub.status === 'LATE' ? 'bg-orange-100 text-orange-800' :
                        sub.status === 'RESUBMITTED' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {sub.status}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs px-2 py-1 border rounded">PENDING</span>
                    )}
                  </td>
                  <td className="p-4">
                    {sub?.grade ? (
                      <span className="font-bold text-gray-900">{sub.grade.score} / {assignment.maxMarks}</span>
                    ) : sub ? (
                      <span className="text-orange-600 text-xs font-semibold">Needs Grading</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    {sub ? (
                      <Link 
                        href={`/dashboard/teacher/assignments/${assignmentId}/grade/${sub.id}`} 
                        className="btn-primary px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        {sub.grade ? 'Re-Grade' : 'Grade'}
                      </Link>
                    ) : (
                      <button disabled className="px-3 py-1 bg-gray-100 text-gray-400 rounded text-xs cursor-not-allowed">
                        Grade
                      </button>
                    )}
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
