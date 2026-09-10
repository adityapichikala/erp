'use client'

import { useState, useEffect } from 'react'

export function FeeRecordsClient() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  
  // Modals state
  const [showPaidModal, setShowPaidModal] = useState<string | null>(null)
  const [showWaivedModal, setShowWaivedModal] = useState<string | null>(null)
  
  // Forms state
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [transactionRef, setTransactionRef] = useState('')
  const [waiverReason, setWaiverReason] = useState('')
  
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [filterStatus])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const url = filterStatus ? `/api/finance/records?status=${filterStatus}` : '/api/finance/records'
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) setRecords(data.records)
    } catch {
      console.error('Failed to load fee records')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'PAID' | 'WAIVED') => {
    setActionLoading(true)
    try {
      const payload: any = { action }
      if (action === 'PAID') {
        payload.paymentDate = paymentDate
        payload.transactionRef = transactionRef
      } else {
        payload.waiverReason = waiverReason
      }

      const res = await fetch(`/api/finance/records/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast(`Record marked as ${action}`)
      setTimeout(() => setToast(null), 3000)
      
      // close modals
      setShowPaidModal(null)
      setShowWaivedModal(null)
      setTransactionRef('')
      setWaiverReason('')
      
      fetchRecords()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
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
          Fee Records
        </h1>
        
        <div className="flex items-center gap-2 bg-white border p-2 rounded">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm outline-none bg-transparent"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Program & Batch</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Due Date</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No records found.</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{r.student.name}</div>
                  <div className="text-xs text-gray-500">{r.student.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-900">{r.feeStructure.programName}</div>
                  <div className="text-xs text-gray-500">Batch: {r.feeStructure.batchYear}</div>
                </td>
                <td className="p-4 font-bold text-gray-900">${r.feeStructure.amount.toFixed(2)}</td>
                <td className="p-4 text-gray-600">{new Date(r.feeStructure.dueDate).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    r.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    r.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {r.status === 'PENDING' && (
                    <>
                      <button onClick={() => setShowPaidModal(r.id)} className="text-blue-600 hover:underline text-sm font-medium">Mark Paid</button>
                      <button onClick={() => setShowWaivedModal(r.id)} className="text-red-600 hover:underline text-sm font-medium">Waive</button>
                    </>
                  )}
                  {r.status !== 'PENDING' && <span className="text-gray-400 text-xs">Locked</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paid Modal */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-sm my-8" style={{ background: 'var(--color-surface)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Mark as Paid</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction Ref (Optional)</label>
                <input type="text" value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="Txn ID" className="w-full p-2 border rounded text-sm" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowPaidModal(null)} className="px-4 py-2 text-sm text-gray-600 border rounded">Cancel</button>
                <button onClick={() => handleAction(showPaidModal, 'PAID')} disabled={actionLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded">
                  {actionLoading ? 'Saving...' : 'Confirm Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waived Modal */}
      {showWaivedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded p-6 w-full max-w-sm my-8" style={{ background: 'var(--color-surface)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Waive Fees</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Waiver</label>
                <textarea required value={waiverReason} onChange={e => setWaiverReason(e.target.value)} className="w-full p-2 border rounded text-sm" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowWaivedModal(null)} className="px-4 py-2 text-sm text-gray-600 border rounded">Cancel</button>
                <button onClick={() => handleAction(showWaivedModal, 'WAIVED')} disabled={actionLoading || !waiverReason} className="px-4 py-2 text-sm bg-red-600 text-white rounded disabled:opacity-50">
                  {actionLoading ? 'Saving...' : 'Confirm Waive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
