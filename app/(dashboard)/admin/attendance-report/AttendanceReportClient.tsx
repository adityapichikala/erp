'use client'

import { useState, useEffect } from 'react'

export function AttendanceReportClient({ departments }: { departments: any[] }) {
  const [report, setReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deptId, setDeptId] = useState('')

  useEffect(() => {
    fetchReport(deptId)
  }, [deptId])

  const fetchReport = async (departmentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = departmentId ? `/api/admin/attendance-report?departmentId=${departmentId}` : '/api/admin/attendance-report'
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReport(data.report || [])
    } catch (err: any) {
      setError(err.message)
      setReport([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Attendance Report
        </h1>
        
        {departments.length > 0 && (
          <div className="bg-white p-3 rounded border flex items-center gap-3">
            <label className="font-medium text-sm">Filter Department:</label>
            <select 
              value={deptId} 
              onChange={e => setDeptId(e.target.value)} 
              className="form-input p-2 border rounded min-w-[200px]"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Course Name</th>
              <th className="p-3">Course Code</th>
              <th className="p-3">Department</th>
              <th className="p-3">Total Marks</th>
              <th className="p-3">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Generating report...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="p-6 text-center text-red-500">{error}</td></tr>
            ) : report.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No attendance data found.</td></tr>
            ) : report.map(row => (
              <tr key={row.courseId} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{row.courseName}</td>
                <td className="p-3 font-mono text-gray-600">{row.courseCode}</td>
                <td className="p-3 text-gray-600">{row.department}</td>
                <td className="p-3 text-gray-600">{row.totalClasses} marks recorded</td>
                <td className="p-3">
                  {row.totalClasses === 0 ? (
                    <span className="text-gray-400">N/A</span>
                  ) : (
                    <span className={`font-bold ${row.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                      {row.percentage}%
                    </span>
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
