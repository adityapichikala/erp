'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'

interface Department {
  id: string
  name: string
}

export function CsvImport({ 
  departments, 
  onClose 
}: { 
  departments: Department[]
  onClose: () => void 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[] | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedUsers = results.data.map((row: any) => {
            // Find department ID if name is provided
            let departmentId = undefined
            if (row.department) {
              const dept = departments.find(d => d.name.toLowerCase() === row.department.trim().toLowerCase())
              if (dept) departmentId = dept.id
            }

            return {
              name: row.name,
              email: row.email,
              role: row.role?.toUpperCase() as Role,
              departmentId,
            }
          })

          const res = await fetch('/api/admin/users/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: parsedUsers })
          })

          const data = await res.json()
          if (!res.ok) {
            setError(data.error || 'Import failed')
          } else {
            setResults(data.results)
            router.refresh()
          }
        } catch (err: any) {
          setError(err.message || 'Error processing CSV')
        } finally {
          setLoading(false)
        }
      },
      error: (error) => {
        setError(`CSV Parse Error: ${error.message}`)
        setLoading(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded p-6 w-full max-w-2xl mt-10 mb-10" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Import Users from CSV
        </h2>

        {!results ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a CSV file with headers: <strong>name, email, role, department</strong>. 
              <br/>Passwords will be automatically generated.
            </p>

            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium text-green-700">Import Complete</h3>
            <div className="max-h-96 overflow-y-auto border rounded">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border-b">Email</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b">Temp Password</th>
                    <th className="p-2 border-b">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${r.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs">{r.tempPassword || '—'}</td>
                      <td className="p-2 text-red-600">{r.error || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="btn-secondary px-4 py-2 border rounded" disabled={loading}>
            {results ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
