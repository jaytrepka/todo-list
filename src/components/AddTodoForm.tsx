'use client'

import { useState } from 'react'
import { Priority } from '@/lib/types'

interface AddTodoFormProps {
  onAdd: (data: { title: string; description: string; priority: Priority; responsible: string }) => void
}

export default function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low' as Priority,
    responsible: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onAdd(formData)
      setFormData({ title: '', description: '', priority: 'low', responsible: '' })
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + Add New Todo
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-2 border-blue-400 rounded-lg bg-white">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Add New Todo</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded text-black"
          placeholder="What needs to be done?"
          autoFocus
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded text-black"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full p-2 border rounded text-black"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Responsible</label>
            <input
              type="text"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              className="w-full p-2 border rounded text-black"
              placeholder="Who's responsible?"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Todo
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
