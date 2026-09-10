'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function AssignmentsClient() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/assignments')
      .then(res => res.json())
      .then(data => {
        setAssignments(data.assignments || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading assignments...</div>

  // Group by course
  const grouped = assignments.reduce((acc, curr) => {
    const code = curr.course.code
    if (!acc[code]) acc[code] = { courseName: curr.course.name, assignments: [] }
    acc[code].assignments.push(curr)
    return acc
  }, {} as Record<string, { courseName: string, assignments: any[] }>)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Assignments
        </h1>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white p-8 rounded border text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-gray-500">You have no assignments due.</p>
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
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Score</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.assignments.map((a: any) => {
                    const isPastDue = new Date(a.dueDate) < new Date()
                    const latestSub = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null
                    
                    let statusLabel = 'Not Submitted'
                    let statusColor = 'bg-gray-100 text-gray-800'
                    
                    if (latestSub) {
                      if (latestSub.grade) {
                        statusLabel = 'Graded'
                        statusColor = 'bg-green-100 text-green-800'
                      } else {
                        statusLabel = latestSub.status
                        statusColor = 'bg-blue-100 text-blue-800'
                      }
                    } else if (isPastDue) {
                      statusLabel = 'Missing'
                      statusColor = 'bg-red-100 text-red-800'
                    }

                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">
                          <Link href={`/dashboard/student/assignments/${a.id}`} className="hover:text-blue-600 hover:underline">
                            {a.title}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className={isPastDue && !latestSub ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(a.dueDate).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          {latestSub?.grade ? `${latestSub.grade.score} / ${a.maxMarks}` : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            href={`/dashboard/student/assignments/${a.id}`} 
                            className="btn-primary px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            {latestSub ? 'View Details' : 'Submit'}
                          </Link>
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
    </div>
  )
}
