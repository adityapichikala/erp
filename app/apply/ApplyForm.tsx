'use client'

import { useState, FormEvent } from 'react'

export function ApplyForm({ programs }: { programs: string[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit application')
      } else {
        setSuccess(true)
        e.currentTarget.reset()
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded border text-center shadow-sm">
        <h2 className="text-2xl font-serif text-[#12213C] mb-4">Application Submitted</h2>
        <p className="text-gray-600 mb-6">
          Thank you for applying to University ERP. Your application has been received and is currently under review.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="btn-primary w-full py-2 bg-[#C9A24B] text-white rounded font-medium"
        >
          Submit Another Application
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
      <div className="text-center mb-8">
        <span className="badge-gold inline-block mb-3 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider" style={{ background: '#C9A24B', color: 'white' }}>
          Admissions
        </span>
        <h1 className="text-3xl font-serif text-[#12213C] mb-2">Apply Now</h1>
        <p className="text-gray-500 text-sm">Join our university programs</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input name="applicantName" type="text" required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#12213C] outline-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input name="email" type="email" required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#12213C] outline-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input name="phone" type="tel" required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#12213C] outline-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program Applied For</label>
          <select name="programAppliedFor" required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#12213C] outline-none transition bg-white">
            <option value="">Select a program</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document (PDF/Image)</label>
          <input 
            name="document" 
            type="file" 
            accept=".pdf,image/*" 
            className="w-full p-2 border rounded text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#FAF8F3] file:text-[#12213C] hover:file:bg-gray-100 transition cursor-pointer" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-[#12213C] text-white rounded font-medium hover:bg-opacity-90 transition disabled:opacity-70 mt-4"
        >
          {loading ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
