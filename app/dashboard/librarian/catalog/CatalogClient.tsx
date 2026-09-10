'use client'

import { useState, useEffect } from 'react'

export function CatalogClient() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [totalCopies, setTotalCopies] = useState('')
  
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchCatalog()
  }, [])

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/librarian/catalog')
      const data = await res.json()
      if (res.ok) setItems(data.items)
    } catch {
      console.error('Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setTitle(item.title)
    setAuthor(item.author)
    setIsbn(item.isbn || '')
    setTotalCopies(item.totalCopies.toString())
    setShowForm(true)
    setError(null)
  }

  const handleAdd = () => {
    setEditId(null)
    setTitle('')
    setAuthor('')
    setIsbn('')
    setTotalCopies('')
    setShowForm(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      const url = editId ? `/api/librarian/catalog/${editId}` : '/api/librarian/catalog'
      const method = editId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, isbn, totalCopies })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save item')
      
      setShowForm(false)
      setToast(editId ? 'Item updated!' : 'Item added!')
      setTimeout(() => setToast(null), 3000)
      
      fetchCatalog()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const res = await fetch(`/api/librarian/catalog/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setToast('Item deleted')
      setTimeout(() => setToast(null), 3000)
      fetchCatalog()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
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
          Library Catalog
        </h1>
        <button onClick={handleAdd} className="btn-primary px-4 py-2 text-white bg-blue-600 rounded">
          Add Book
        </button>
      </div>

      <div className="bg-white rounded border overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">ISBN</th>
              <th className="p-4 text-center">Total Copies</th>
              <th className="p-4 text-center">Available</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No items in the catalog.</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{item.title}</td>
                <td className="p-4">{item.author}</td>
                <td className="p-4 text-gray-500">{item.isbn || '-'}</td>
                <td className="p-4 text-center">{item.totalCopies}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.availableCopies}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-sm">Delete</button>
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
              {editId ? 'Edit Book' : 'Add Book'}
            </h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label block font-medium mb-1">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Author</label>
                <input type="text" required value={author} onChange={e => setAuthor(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">ISBN</label>
                <input type="text" value={isbn} onChange={e => setIsbn(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>
              <div>
                <label className="form-label block font-medium mb-1">Total Copies</label>
                <input type="number" required min="1" value={totalCopies} onChange={e => setTotalCopies(e.target.value)} className="form-input w-full p-2 border rounded" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 hover:bg-blue-700">
                  {formLoading ? 'Saving...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
