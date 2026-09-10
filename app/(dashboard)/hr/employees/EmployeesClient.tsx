'use client'

import { useState, useEffect } from 'react'

export function EmployeesClient({ users, departments }: { users: any[], departments: any[] }) {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [userId, setUserId] = useState('')
  const [designation, setDesignation] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [salaryBand, setSalaryBand] = useState('')
  const [joinedAt, setJoinedAt] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr/employees')
      const data = await res.json()
      if (res.ok) setEmployees(data.employees)
    } catch {
      console.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (emp: any) => {
    setEditId(emp.id)
    setUserId(emp.userId)
    setDesignation(emp.designation)
    setDepartmentId(emp.departmentId)
    setSalaryBand(emp.salaryBand)
    setJoinedAt(new Date(emp.joinedAt).toISOString().split('T')[0])
    setShowForm(true)
    setError(null)
  }

  const handleAdd = () => {
    setEditId(null)
    setUserId('')
    setDesignation('')
    setDepartmentId('')
    setSalaryBand('')
    setJoinedAt('')
    setShowForm(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const url = editId ? `/api/hr/employees/${editId}` : '/api/hr/employees'
      const method = editId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, designation, departmentId, salaryBand, joinedAt })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save employee')
      
      setShowForm(false)
      setToast(editId ? 'Employee updated!' : 'Employee created!')
      setTimeout(() => setToast(null), 3000)
      
      fetchEmployees()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee record? The user account will remain.')) return
    try {
      const res = await fetch(`/api/hr/employees/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Employee deleted')
      setTimeout(() => setToast(null), 3000)
      fetchEmployees()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  // Filter out users who already have an employee record for the creation dropdown
  const availableUsers = users.filter(u => !employees.some(e => e.userId === u.id))

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Employee Directory
        </h1>
        <button onClick={handleAdd} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name / Role</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Department</th>
              <th className="p-4">Salary Band</th>
              <th className="p-4">Joined At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No employees found.</td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{emp.user.name}</div>
                  <div className="text-xs text-gray-500">{emp.user.role} &bull; {emp.user.email}</div>
                </td>
                <td className="p-4 font-medium text-gray-800">{emp.designation}</td>
                <td className="p-4 text-gray-600">{emp.department.name}</td>
                <td className="p-4 text-gray-600">{emp.salaryBand}</td>
                <td className="p-4 text-gray-600">{new Date(emp.joinedAt).toLocaleDateString()}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:underline text-sm">Delete</button>
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
              {editId ? 'Edit Employee' : 'Add Employee'}
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {!editId && (
                <div>
                  <label className="form-label block font-medium mb-1">User Account</label>
                  <select required value={userId} onChange={e => setUserId(e.target.value)} className="form-input w-full p-2 border rounded">
                    <option value="">Select User...</option>
                    {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Only users with staff roles that aren't already employees are shown.</p>
                </div>
              )}
              
              <div>
                <label className="form-label block font-medium mb-1">Designation</label>
                <input type="text" required value={designation} onChange={e => setDesignation(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. Senior Professor" />
              </div>
              
              <div>
                <label className="form-label block font-medium mb-1">Department</label>
                <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="form-input w-full p-2 border rounded">
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label block font-medium mb-1">Salary Band</label>
                <input type="text" required value={salaryBand} onChange={e => setSalaryBand(e.target.value)} className="form-input w-full p-2 border rounded" placeholder="e.g. L3, L4" />
              </div>

              <div>
                <label className="form-label block font-medium mb-1">Joined Date</label>
                <input type="date" required value={joinedAt} onChange={e => setJoinedAt(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
