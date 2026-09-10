'use client'

import { useState, useEffect } from 'react'

export function AttendanceViewer() {
  const [summary, setSummary] = useState<any[]>([])
  const [recentRecords, setRecentRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/student/attendance')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSummary(data.summary)
        setRecentRecords(data.recentRecords)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-6">Loading attendance data...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Attendance
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {summary.length === 0 ? (
          <div className="col-span-full text-gray-500">No attendance data available yet.</div>
        ) : summary.map(stat => (
          <div 
            key={stat.courseId} 
            className="bg-white p-6 rounded border flex flex-col justify-between" 
            style={{ 
              borderColor: 'var(--color-border)',
              borderLeftWidth: '4px',
              borderLeftColor: stat.percentage < 75 ? '#dc2626' : '#16a34a' // red if <75%, green otherwise
            }}
          >
            <div>
              <h3 className="font-bold text-lg text-gray-900">{stat.courseCode}</h3>
              <p className="text-sm text-gray-600 mb-4">{stat.courseName}</p>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-500">Total Classes: {stat.totalClasses}</div>
                <div className="text-xs text-green-600">Present/Late: {stat.presentClasses + stat.lateClasses}</div>
                <div className="text-xs text-red-600">Absent: {stat.absentClasses}</div>
              </div>
              <div className={`text-3xl font-bold ${stat.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                {stat.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
        Recent History
      </h2>
      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Course</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentRecords.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">No recent records.</td></tr>
            ) : recentRecords.map(rec => (
              <tr key={rec.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 text-gray-700">{new Date(rec.date).toLocaleDateString()}</td>
                <td className="p-3 font-medium text-gray-900">{rec.course.name} ({rec.course.code})</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    rec.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                    rec.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
