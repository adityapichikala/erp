'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Department {
  id: string
  name: string
}

interface ClassModel {
  id: string
  name: string
  departmentId: string
}

export function AdmissionsClient({ admissions, departments, classes }: { admissions: any[], departments: Department[], classes: ClassModel[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [converting, setConverting] = useState<any | null>(null)
  
  // Convert Form State
  const [deptId, setDeptId] = useState('')
  const [classId, setClassId] = useState('')
  const [convertError, setConvertError] = useState<string | null>(null)
  const [convertSuccess, setConvertSuccess] = useState<any | null>(null)

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/admissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      router.refresh()
    } catch {
      alert('Failed to update status')
    }
  }

  const handleMeritScoreChange = async (id: string, score: string) => {
    try {
      await fetch(`/api/admin/admissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meritScore: parseFloat(score) || null })
      })
      router.refresh()
    } catch {
      alert('Failed to update merit score')
    }
  }

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    router.push(`/dashboard/admin/admissions?${params.toString()}`)
  }

  const handleConvert = async () => {
    setConvertError(null)
    setConvertSuccess(null)
    if (!deptId || !classId) {
      setConvertError('Please select a department and class')
      return
    }

    try {
      const res = await fetch(`/api/admin/admissions/${converting.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId: deptId, classId })
      })
      
      const data = await res.json()
      if (!res.ok) {
        setConvertError(data.error || 'Failed to convert')
      } else {
        setConvertSuccess({ tempPassword: data.tempPassword })
        router.refresh()
      }
    } catch (err: any) {
      setConvertError(err.message || 'Network error')
    }
  }

  const filteredClasses = classes.filter(c => c.departmentId === deptId)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Admissions Management
        </h1>
      </div>

      <div className="bg-white p-4 rounded mb-6 flex gap-4 items-center border" style={{ borderColor: 'var(--color-border)' }}>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="form-input p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="WAITLISTED">WAITLISTED</option>
        </select>
        <button onClick={handleFilter} className="btn-secondary px-4 py-2 border rounded">
          Filter
        </button>
      </div>

      <div className="bg-white rounded overflow-x-auto border" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Applicant</th>
              <th className="p-3">Program</th>
              <th className="p-3">Score</th>
              <th className="p-3">Status</th>
              <th className="p-3">Docs</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No applications found.</td></tr>
            ) : admissions.map(app => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium text-gray-900">{app.applicantName}</div>
                  <div className="text-gray-500 text-xs">{app.email}</div>
                  <div className="text-gray-500 text-xs">{app.phone}</div>
                </td>
                <td className="p-3 text-gray-600">{app.programAppliedFor}</td>
                <td className="p-3">
                  <input 
                    type="number" 
                    defaultValue={app.meritScore || ''} 
                    onBlur={(e) => handleMeritScoreChange(app.id, e.target.value)}
                    className="w-16 p-1 border rounded text-center"
                    placeholder="—"
                  />
                </td>
                <td className="p-3">
                  <select 
                    value={app.status} 
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`p-1 border rounded text-xs font-semibold ${
                      app.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="WAITLISTED">WAITLISTED</option>
                  </select>
                </td>
                <td className="p-3">
                  {app.documentsUrl ? (
                    <a href={app.documentsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
                      View Doc
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">No doc</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {app.status === 'APPROVED' && !app.convertedToUserId && (
                    <button 
                      onClick={() => { setConverting(app); setConvertSuccess(null); }}
                      className="text-xs bg-[#12213C] text-white px-3 py-1.5 rounded hover:bg-opacity-90"
                    >
                      Convert to Student
                    </button>
                  )}
                  {app.convertedToUserId && (
                    <span className="text-xs text-green-600 font-semibold">Converted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {converting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              Convert {converting.applicantName} to Student
            </h2>
            
            {convertError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{convertError}</div>}
            
            {convertSuccess ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200">
                  Successfully converted to student!
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Temporary Password:</p>
                  <p className="font-mono text-lg font-bold bg-gray-100 p-2 rounded text-center">{convertSuccess.tempPassword}</p>
                  <p className="text-xs text-gray-500 mt-2">Please share this securely with the student. It will not be shown again.</p>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => setConverting(null)} className="btn-secondary px-4 py-2 border rounded">Close</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select 
                    value={deptId} 
                    onChange={(e) => { setDeptId(e.target.value); setClassId(''); }}
                    className="form-input w-full p-2 border rounded"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select 
                    value={classId} 
                    onChange={(e) => setClassId(e.target.value)}
                    className="form-input w-full p-2 border rounded"
                    disabled={!deptId}
                  >
                    <option value="">Select Class...</option>
                    {filteredClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setConverting(null)} className="btn-secondary px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button onClick={handleConvert} className="btn-primary px-4 py-2 bg-[#12213C] text-white rounded">
                    Convert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
