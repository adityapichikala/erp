'use client'

import { useState, useEffect } from 'react'

export function MarksEntryClient({ exams }: { exams: any[] }) {
  const [selectedExamId, setSelectedExamId] = useState('')
  const [exam, setExam] = useState<any>(null)
  const [roster, setRoster] = useState<any[]>([])
  const [marksMap, setMarksMap] = useState<Record<string, string>>({})
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    if (selectedExamId) {
      fetchRoster(selectedExamId)
    } else {
      setRoster([])
      setExam(null)
      setIsPublished(false)
    }
  }, [selectedExamId])

  const fetchRoster = async (examId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/roster`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setExam(data.exam)
      setRoster(data.roster)
      setIsPublished(data.isPublished)

      const initialMarks: Record<string, string> = {}
      for (const r of data.roster) {
        if (r.result) {
          initialMarks[r.studentId] = r.result.marksObtained.toString()
        }
      }
      setMarksMap(initialMarks)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksMap(prev => ({ ...prev, [studentId]: value }))
  }

  const handleSave = async () => {
    if (!exam) return

    // Build payload and validate client-side
    const marksToSave = []
    for (const r of roster) {
      const valStr = marksMap[r.studentId]
      if (valStr !== undefined && valStr !== '') {
        const val = parseFloat(valStr)
        if (val < 0 || val > exam.maxMarks) {
          setError(`Invalid marks for ${r.studentName}. Must be between 0 and ${exam.maxMarks}`)
          return
        }
        marksToSave.push({ studentId: r.studentId, marksObtained: val })
      }
    }

    if (marksToSave.length === 0) {
      setError('No marks entered to save.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/teacher/exams/${exam.id}/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: marksToSave })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save marks')
      
      setToast('Marks saved successfully!')
      setTimeout(() => setToast(null), 3000)
      
      fetchRoster(exam.id) // Refresh grades
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 font-medium">
          {toast}
        </div>
      )}

      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-navy)' }}>
          Marks Entry
        </h1>
        
        <div className="bg-white p-3 rounded border flex items-center gap-3">
          <label className="font-medium text-sm">Select Exam:</label>
          <select 
            value={selectedExamId} 
            onChange={e => setSelectedExamId(e.target.value)} 
            className="form-input p-2 border rounded min-w-[250px]"
          >
            <option value="">-- Choose an exam --</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.course.name} - {e.examType} ({new Date(e.examDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

      {exam && (
        <div className="bg-white rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg" style={{ color: 'var(--color-navy)' }}>
                {exam.course.name} ({exam.course.code}) - {exam.examType}
              </h2>
              <p className="text-sm text-gray-500">Max Marks: {exam.maxMarks}</p>
            </div>
            {isPublished && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-sm">
                RESULTS PUBLISHED (Locked)
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading roster...</div>
          ) : roster.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No students enrolled in this course.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Student Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Marks Obtained</th>
                    <th className="p-4 font-medium">Computed Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(r => (
                    <tr key={r.studentId} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{r.studentName}</td>
                      <td className="p-4 text-gray-500">{r.studentEmail}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={exam.maxMarks}
                          value={marksMap[r.studentId] || ''}
                          onChange={e => handleMarkChange(r.studentId, e.target.value)}
                          disabled={isPublished || saving}
                          className="form-input p-2 border rounded w-24 text-center font-bold disabled:bg-gray-100"
                        />
                        {marksMap[r.studentId] !== undefined && parseFloat(marksMap[r.studentId]) > exam.maxMarks && (
                          <span className="text-red-500 text-xs ml-2">Exceeds Max!</span>
                        )}
                      </td>
                      <td className="p-4">
                        {r.result ? (
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border">
                            {r.result.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {!isPublished && (
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn-primary px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Marks'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
