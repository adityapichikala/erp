'use client'

import { useState, useEffect } from 'react'

export function FeeStructuresClient() {
  const [structures, setStructures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [programName, setProgramName] = useState('')
  const [batchYear, setBatchYear] = useState(new Date().getFullYear().toString())
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchStructures()
  }, [])

  const fetchStructures = async () => {
    try {
      const res = await fetch('/api/finance/fee-structures')
      const data = await res.json()
      if (res.ok) setStructures(data.feeStructures)
    } catch {
      console.error('Failed to load fee structures')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/finance/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programName, batchYear, amount, dueDate })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create fee structure')
      
      setShowForm(false)
      setToast('Fee structure created successfully!')
      setTimeout(() => setToast(null), 3000)
      
      setProgramName(''); setAmount(''); setDueDate('')
      fetchStructures()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this structure? Ensure no payments are tied to it.')) return
    try {
      await fetch(`/api/finance/fee-structures/${id}`, { method: 'DELETE' })
      setToast('Structure deleted')
      setTimeout(() => setToast(null), 3000)
      fetchStructures()
    } catch {
      alert('Failed to delete')
    }
  }

  const handleAssign = async (id: string) => {
    if (!confirm('This will automatically generate Fee Records for all eligible students in this batch. Proceed?')) return
    try {
      const res = await fetch(`/api/finance/fee-structures/${id}/assign`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setToast(`Assigned to ${data.assignedCount} students successfully!`)
        setTimeout(() => setToast(null), 3000)
        fetchStructures()
      } else {
        alert(data.error)
      }
    } catch {
      alert('Failed to assign fees')
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
          Fee Structures
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Create Structure
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Program</th>
              <th className="p-4">Batch Year</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Due Date</th>
              <th className="p-4 text-center">Assigned Records</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : structures.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No fee structures defined yet.</td></tr>
            ) : structures.map(str => (
              <tr key={str.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{str.programName}</td>
                <td className="p-4">{str.batchYear}</td>
                <td className="p-4 font-bold text-gray-900">${str.amount.toFixed(2)}</td>
                <td className="p-4 text-gray-600">{new Date(str.dueDate).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {str._count?.feeRecords || 0}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleAssign(str.id)} className="text-blue-600 hover:underline text-sm font-medium">Assign to Batch</button>
                  <button onClick={() => handleDelete(str.id)} className="text-red-600 hover:underline text-sm">Delete</button>
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
              New Fee Structure
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Program Name</label>
                <input type="text" required value={programName} onChange={e => setProgramName(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Batch Year</label>
                <input type="number" required value={batchYear} onChange={e => setBatchYear(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Total Amount ($)</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Due Date</label>
                <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Creating...' : 'Create Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
