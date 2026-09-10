'use client'

import { useState, useEffect } from 'react'

export function FeesClient() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/student/fees')
      const data = await res.json()
      if (res.ok) setRecords(data.records)
    } catch {
      console.error('Failed to load fee records')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id: string) => {
    setPaying(id)
    try {
      const res = await fetch(`/api/student/fees/${id}/pay`, { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      
      setToast(`Payment successful! Ref: ${data.transactionRef}`)
      setTimeout(() => setToast(null), 4000)
      fetchRecords()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setPaying(null)
    }
  }

  // Calculate summary
  const totalDue = records.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE').reduce((sum, r) => sum + r.feeStructure.amount, 0)
  const totalPaid = records.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amountPaid, 0)

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 font-medium">
          {toast}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Fees
        </h1>
        
        <div className="flex gap-4">
          <div className="bg-white px-4 py-3 rounded border shadow-sm flex flex-col items-end" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Paid</span>
            <div className="text-xl font-bold text-green-600 leading-none">${totalPaid.toFixed(2)}</div>
          </div>
          <div className="bg-white px-4 py-3 rounded border shadow-sm flex flex-col items-end" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Due</span>
            <div className="text-xl font-bold text-red-600 leading-none">${totalDue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Description</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Due Date</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Payment Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No fee records found.</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{r.feeStructure.programName} Fees</div>
                  <div className="text-xs text-gray-500">Batch {r.feeStructure.batchYear}</div>
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
                <td className="p-4 text-right">
                  {r.status === 'PAID' ? (
                    <div className="text-xs text-gray-500">
                      <div>Paid on: {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : 'N/A'}</div>
                      <div>Ref: {r.transactionRef}</div>
                    </div>
                  ) : r.status === 'WAIVED' ? (
                    <span className="text-gray-400 text-xs italic">Waived</span>
                  ) : (
                    <button 
                      onClick={() => handlePay(r.id)}
                      disabled={paying === r.id}
                      className="btn-primary px-4 py-2 bg-blue-600 text-white rounded font-medium text-xs disabled:opacity-50"
                    >
                      {paying === r.id ? 'Processing...' : 'Pay Now'}
                    </button>
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
