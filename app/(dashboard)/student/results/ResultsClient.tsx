'use client'

import { useState, useEffect } from 'react'

export function ResultsClient() {
  const [results, setResults] = useState<any[]>([])
  const [cgpa, setCgpa] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/results')
      .then(res => res.json())
      .then(data => {
        setResults(data.results || [])
        setCgpa(data.cgpa || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading results...</div>

  return (
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Results
        </h1>
        
        {results.length > 0 && (
          <div className="bg-white px-6 py-3 rounded border shadow-sm flex flex-col items-end" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Cumulative GPA</span>
            <div className="text-3xl font-black text-blue-600 leading-none">
              {cgpa.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Course</th>
              <th className="p-4">Exam Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Credits</th>
              <th className="p-4">Marks Obtained</th>
              <th className="p-4 font-bold text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No published results available yet.</td></tr>
            ) : results.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{r.exam.course.name}</div>
                  <div className="text-xs text-gray-500">{r.exam.course.code}</div>
                </td>
                <td className="p-4 font-medium text-gray-700">{r.exam.examType}</td>
                <td className="p-4 text-gray-600">{new Date(r.exam.examDate).toLocaleDateString()}</td>
                <td className="p-4 text-gray-600">{r.exam.course.credits}</td>
                <td className="p-4 font-medium">
                  {r.marksObtained} <span className="text-gray-400 text-xs">/ {r.exam.maxMarks}</span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                    r.grade === 'F' ? 'bg-red-100 text-red-800' :
                    r.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {r.grade}
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
