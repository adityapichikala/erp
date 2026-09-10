'use client'

import { useState, useEffect } from 'react'

export function ReportsClient() {
  const [report, setReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/finance/reports')
      .then(res => res.json())
      .then(data => {
        setReport(data.report || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const grandTotalDue = report.reduce((sum, r) => sum + r.totalDue, 0)
  const grandTotalCollected = report.reduce((sum, r) => sum + r.totalCollected, 0)
  const grandTotalDeficit = grandTotalDue - grandTotalCollected

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Financial Reports
        </h1>
        <p className="text-gray-600">Overview of fee collection grouped by program and batch.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Due</h3>
          <div className="text-3xl font-black text-gray-900">${grandTotalDue.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded border border-green-200 shadow-sm">
          <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">Total Collected</h3>
          <div className="text-3xl font-black text-green-700">${grandTotalCollected.toFixed(2)}</div>
          <div className="mt-2 text-sm text-green-600 font-medium">
            {grandTotalDue > 0 ? ((grandTotalCollected / grandTotalDue) * 100).toFixed(1) : 0}% Collection Rate
          </div>
        </div>
        <div className="bg-white p-6 rounded border border-red-200 shadow-sm">
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">Total Deficit</h3>
          <div className="text-3xl font-black text-red-700">${Math.max(0, grandTotalDeficit).toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Program & Batch</th>
              <th className="p-4 text-center">Students Assigned</th>
              <th className="p-4 text-right">Total Due</th>
              <th className="p-4 text-right">Total Collected</th>
              <th className="p-4 text-right">Deficit</th>
              <th className="p-4 text-right">Collection Rate</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading report...</td></tr>
            ) : report.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No data available for reporting.</td></tr>
            ) : report.map((r, idx) => {
              const deficit = r.totalDue - r.totalCollected
              const rate = r.totalDue > 0 ? (r.totalCollected / r.totalDue) * 100 : 0
              return (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{r.programName}</div>
                    <div className="text-xs text-gray-500">Batch: {r.batchYear}</div>
                  </td>
                  <td className="p-4 text-center">{r.studentCount}</td>
                  <td className="p-4 text-right font-medium text-gray-900">${r.totalDue.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-green-600">${r.totalCollected.toFixed(2)}</td>
                  <td className="p-4 text-right font-medium text-red-600">${Math.max(0, deficit).toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium">{rate.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${Math.min(100, rate)}%` }}
                        ></div>
                      </div>
                    </div>
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
