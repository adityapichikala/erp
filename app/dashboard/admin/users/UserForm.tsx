'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'

interface Department {
  id: string
  name: string
}

interface UserData {
  id?: string
  name: string
  email: string
  role: Role
  departmentId?: string
  password?: string
  status?: string
}

export function UserForm({ 
  user, 
  departments, 
  onSuccess, 
  onCancel 
}: { 
  user?: UserData | null
  departments: Department[]
  onSuccess: () => void
  onCancel: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!user?.id

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      role: (form.elements.namedItem('role') as HTMLSelectElement).value,
      departmentId: (form.elements.namedItem('departmentId') as HTMLSelectElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement)?.value,
    }

    try {
      const url = isEdit ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Failed to save user')
        return
      }

      onSuccess()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded p-6 w-full max-w-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          {isEdit ? 'Edit User' : 'Create User'}
        </h2>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label block text-sm font-medium mb-1">Name</label>
            <input name="name" type="text" required defaultValue={user?.name} className="form-input w-full p-2 border rounded" />
          </div>

          <div>
            <label className="form-label block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" required defaultValue={user?.email} className="form-input w-full p-2 border rounded" />
          </div>

          {!isEdit && (
            <div>
              <label className="form-label block text-sm font-medium mb-1">Password</label>
              <input name="password" type="password" required={!isEdit} className="form-input w-full p-2 border rounded" />
            </div>
          )}

          <div>
            <label className="form-label block text-sm font-medium mb-1">Role</label>
            <select name="role" required defaultValue={user?.role || 'STUDENT'} className="form-input w-full p-2 border rounded">
              {Object.values(Role).map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label block text-sm font-medium mb-1">Department (Optional)</label>
            <select name="departmentId" defaultValue={user?.departmentId || ''} className="form-input w-full p-2 border rounded">
              <option value="">-- None --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 border rounded" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2 text-white rounded bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
