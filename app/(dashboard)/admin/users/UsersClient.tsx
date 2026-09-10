'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
import { UserForm } from './UserForm'
import { CsvImport } from './CsvImport'

export function UsersClient({ users, departments }: { users: any[], departments: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const toggleStatus = async (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    if (!confirm(`Are you sure you want to ${newStatus === 'INACTIVE' ? 'deactivate' : 'reactivate'} ${user.name}?`)) return

    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      router.refresh()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (roleFilter) params.set('role', roleFilter)
    router.push(`/dashboard/admin/users?${params.toString()}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          User Management
        </h1>
        <div className="flex gap-3">
          <button onClick={() => setShowImport(true)} className="btn-secondary px-4 py-2 border rounded">
            Import CSV
          </button>
          <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded mb-6 flex gap-4 items-center" style={{ border: '1px solid var(--color-border)' }}>
        <input 
          type="text" 
          placeholder="Search name or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="form-input p-2 border rounded flex-grow"
        />
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-input p-2 border rounded"
        >
          <option value="">All Roles</option>
          {Object.values(Role).map(r => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button onClick={handleSearch} className="btn-secondary px-4 py-2 border rounded">
          Filter
        </button>
      </div>

      <div className="bg-white rounded overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Department</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{user.name}</td>
                <td className="p-3 text-gray-600">{user.email}</td>
                <td className="p-3">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{user.department?.name || '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3">
                  <button onClick={() => { setEditingUser(user); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => toggleStatus(user)} className={`${user.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'} hover:underline`}>
                    {user.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm 
          user={editingUser} 
          departments={departments} 
          onSuccess={() => setShowForm(false)} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {showImport && (
        <CsvImport 
          departments={departments} 
          onClose={() => setShowImport(false)} 
        />
      )}
    </div>
  )
}
