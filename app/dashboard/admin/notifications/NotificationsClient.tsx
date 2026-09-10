'use client'

import { useState } from 'react'

export function NotificationsClient({ departments, classes, currentUserRole }: { departments: any[], classes: any[], currentUserRole: string }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [targetDepartmentId, setTargetDepartmentId] = useState('')
  const [targetClassId, setTargetClassId] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          body, 
          targetRole: targetRole || null, 
          targetDepartmentId: targetDepartmentId || null, 
          targetClassId: targetClassId || null 
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send notification')
      
      setToast('Notification sent successfully!')
      setTimeout(() => setToast(null), 3000)
      
      setTitle(''); setBody(''); setTargetRole(''); setTargetDepartmentId(''); setTargetClassId('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
        Send Notification
      </h1>

      <div className="bg-white rounded p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="form-label block font-medium mb-1">Title</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. Upcoming Maintenance" />
          </div>
          
          <div>
            <label className="form-label block font-medium mb-1">Message Body</label>
            <textarea required value={body} onChange={e => setBody(e.target.value)} className="form-input w-full p-2 border rounded" rows={4}></textarea>
          </div>

          <div className="pt-4 border-t mt-4">
            <h3 className="font-semibold mb-3 text-gray-700">Target Audience (Optional)</h3>
            <p className="text-xs text-gray-500 mb-4">Leave fields blank to broadcast to everyone in your allowed scope.</p>

            {currentUserRole !== 'TEACHER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label block font-medium mb-1">Target Role</label>
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="form-input w-full p-2 border rounded">
                    <option value="">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="TEACHER">Teachers</option>
                    <option value="HOD">HODs</option>
                    <option value="HR">HR</option>
                    <option value="PARENT">Parents</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label block font-medium mb-1">Target Department</label>
                  <select value={targetDepartmentId} onChange={e => setTargetDepartmentId(e.target.value)} className="form-input w-full p-2 border rounded">
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="form-label block font-medium mb-1">Target Class</label>
              <select value={targetClassId} onChange={e => setTargetClassId(e.target.value)} className="form-input w-full p-2 border rounded">
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
