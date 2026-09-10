'use client'

import { useState } from 'react'

export function CertificatesClient({ students }: { students: any[] }) {
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState('BONAFIDE')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/registrar/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, type })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate certificate')
      
      setToast('Certificate generated successfully!')
      setTimeout(() => setToast(null), 3000)
      
      setStudentId('')
      setType('BONAFIDE')
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

      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Generate Certificate
        </h1>
        <p className="text-gray-600 mt-1">Issue official documents for students.</p>
      </div>

      <div className="bg-white rounded p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded border border-red-200 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          <div>
            <label className="form-label block font-medium mb-1">Select Student</label>
            <select required value={studentId} onChange={e => setStudentId(e.target.value)} className="form-input w-full p-2 border rounded">
              <option value="">-- Choose a Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email}) - {s.department?.name || 'No Dept'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label block font-medium mb-1">Certificate Type</label>
            <select required value={type} onChange={e => setType(e.target.value)} className="form-input w-full p-2 border rounded">
              <option value="BONAFIDE">Bonafide Certificate</option>
              <option value="TRANSCRIPT">Academic Transcript</option>
              <option value="NO_DUES">No-Dues Certificate</option>
            </select>
            {type === 'NO_DUES' && (
              <p className="text-xs text-yellow-600 mt-2 font-medium">
                Warning: The system will automatically block generation if the student has pending fees or library fines.
              </p>
            )}
            {type === 'TRANSCRIPT' && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Note: Transcripts only include published exam results.
              </p>
            )}
          </div>

          <div className="pt-4 border-t mt-4">
            <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">
              {loading ? 'Generating Document...' : 'Generate & Save PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
