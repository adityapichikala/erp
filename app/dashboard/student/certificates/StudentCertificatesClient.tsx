'use client'

import { useState, useEffect } from 'react'

export function StudentCertificatesClient() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/student/certificates')
      const data = await res.json()
      if (res.ok) setCertificates(data.certificates)
    } catch {
      console.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          My Certificates
        </h1>
        <p className="text-gray-600 mt-1">View and download your officially issued documents.</p>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Document Type</th>
              <th className="p-4">Issued On</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading documents...</td></tr>
            ) : certificates.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">No certificates have been issued yet.</td></tr>
            ) : certificates.map(cert => (
              <tr key={cert.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">
                  {cert.type === 'BONAFIDE' ? 'Bonafide Certificate' :
                   cert.type === 'TRANSCRIPT' ? 'Academic Transcript' : 'No-Dues Certificate'}
                </td>
                <td className="p-4 text-gray-600">{new Date(cert.issuedAt || cert.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  {cert.signedUrl ? (
                    <a 
                      href={cert.signedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded inline-block transition-colors"
                    >
                      View / Download PDF
                    </a>
                  ) : (
                    <span className="text-red-500 text-xs font-medium">Link Expired or Unavailable</span>
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
