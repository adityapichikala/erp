'use client'

import { useState, useEffect } from 'react'

export function DrivesClient() {
  const [drives, setDrives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [eligibilityCriteria, setEligibilityCriteria] = useState('')
  const [driveDate, setDriveDate] = useState('')
  const [packageOffered, setPackageOffered] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const res = await fetch('/api/placement/drives')
      const data = await res.json()
      if (res.ok) setDrives(data.drives)
    } catch {
      console.error('Failed to load placement drives')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (drive: any) => {
    setEditId(drive.id)
    setCompanyName(drive.companyName)
    setRole(drive.role)
    setEligibilityCriteria(drive.eligibilityCriteria)
    setDriveDate(new Date(drive.driveDate).toISOString().split('T')[0])
    setPackageOffered(drive.packageOffered)
    setShowForm(true)
    setError(null)
  }

  const handleAdd = () => {
    setEditId(null)
    setCompanyName('')
    setRole('')
    setEligibilityCriteria('')
    setDriveDate('')
    setPackageOffered('')
    setShowForm(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const url = editId ? `/api/placement/drives/${editId}` : '/api/placement/drives'
      const method = editId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, role, eligibilityCriteria, driveDate, packageOffered })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save placement drive')
      
      setShowForm(false)
      setToast(editId ? 'Drive updated!' : 'Drive created!')
      setTimeout(() => setToast(null), 3000)
      
      fetchDrives()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this placement drive? Applications will also be removed.')) return
    try {
      const res = await fetch(`/api/placement/drives/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Drive deleted')
      setTimeout(() => setToast(null), 3000)
      fetchDrives()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
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
          Placement Drives
        </h1>
        <button onClick={handleAdd} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Create Drive
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role / Package</th>
              <th className="p-4">Drive Date</th>
              <th className="p-4">Eligibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : drives.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No placement drives found.</td></tr>
            ) : drives.map(drive => (
              <tr key={drive.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{drive.companyName}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-800">{drive.role}</div>
                  <div className="text-xs text-green-600 font-bold">{drive.packageOffered}</div>
                </td>
                <td className="p-4 text-gray-600">{new Date(drive.driveDate).toLocaleDateString()}</td>
                <td className="p-4 text-gray-600 max-w-xs truncate" title={drive.eligibilityCriteria}>
                  {drive.eligibilityCriteria}
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(drive)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(drive.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-md my-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
              {editId ? 'Edit Placement Drive' : 'Create Placement Drive'}
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Company Name</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              
              <div>
                <label className="form-label block font-medium mb-1">Role/Designation</label>
                <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. Software Engineer" />
              </div>

              <div>
                <label className="form-label block font-medium mb-1">Package Offered</label>
                <input type="text" required value={packageOffered} onChange={e => setPackageOffered(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. 12 LPA" />
              </div>

              <div>
                <label className="form-label block font-medium mb-1">Drive Date</label>
                <input type="date" required value={driveDate} onChange={e => setDriveDate(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>

              <div>
                <label className="form-label block font-medium mb-1">Eligibility Criteria</label>
                <textarea required value={eligibilityCriteria} onChange={e => setEligibilityCriteria(e.target.value)} className="form-input w-full p-2 border rounded" rows={3} placeholder="e.g. B.Tech CS, Minimum 7.0 CGPA"></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Saving...' : 'Save Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
