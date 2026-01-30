'use client'

import { useState } from 'react'
import { Group, GROUP_COLORS } from '@/lib/types'

interface GroupTabsProps {
  groups: Group[]
  activeGroupId: string
  onSelectGroup: (groupId: string) => void
  onCreateGroup: (name: string) => void
  onRenameGroup: (id: string, name: string) => void
  onChangeGroupColor: (id: string, color: string) => void
  onDeleteGroup: (id: string) => void
}

export default function GroupTabs({
  groups,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
  onRenameGroup,
  onChangeGroupColor,
  onDeleteGroup,
}: GroupTabsProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [colorPickerId, setColorPickerId] = useState<string | null>(null)

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim())
      setNewGroupName('')
      setIsCreating(false)
    }
  }

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
    setColorPickerId(null)
  }

  const handleSaveRename = () => {
    if (editingId && editName.trim()) {
      onRenameGroup(editingId, editName.trim())
      setEditingId(null)
      setEditName('')
    }
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleColorSelect = (groupId: string, color: string) => {
    onChangeGroupColor(groupId, color)
    setColorPickerId(null)
  }

  const allTabs = [
    { id: 'common', name: 'Common', color: '#6b7280' },
    ...groups.map((g) => ({ id: g.id, name: g.name, color: g.color })),
  ]

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        {allTabs.map((tab) => (
          <div key={tab.id} className="relative group">
            {editingId === tab.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename()
                    if (e.key === 'Escape') handleCancelRename()
                  }}
                  className="px-2 py-1 border rounded text-sm text-black w-24"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelectGroup(tab.id)}
                  onDoubleClick={() => {
                    if (tab.id !== 'common') {
                      handleStartRename(tab.id, tab.name)
                    }
                  }}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeGroupId === tab.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={activeGroupId === tab.id ? { backgroundColor: tab.color } : undefined}
                  title={tab.id !== 'common' ? 'Double-click to rename' : undefined}
                >
                  {tab.id !== 'common' && (
                    <span 
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: tab.color }}
                    />
                  )}
                  {tab.name}
                </button>
                {tab.id !== 'common' && activeGroupId === tab.id && (
                  <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setColorPickerId(colorPickerId === tab.id ? null : tab.id)
                        setEditingId(null)
                      }}
                      className="w-5 h-5 bg-purple-500 text-white rounded-full text-xs hover:bg-purple-600 flex items-center justify-center"
                      title="Change color"
                    >
                      🎨
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRename(tab.id, tab.name)
                      }}
                      className="w-5 h-5 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 flex items-center justify-center"
                      title="Rename group"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete group "${tab.name}"? Todos will be moved to Common.`)) {
                          onDeleteGroup(tab.id)
                        }
                      }}
                      className="w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                      title="Delete group"
                    >
                      ×
                    </button>
                  </div>
                )}
                {/* Color Picker Dropdown */}
                {colorPickerId === tab.id && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10 flex gap-1 flex-wrap w-32">
                    {GROUP_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(tab.id, color)}
                        className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{ 
                          backgroundColor: color,
                          borderColor: tab.color === color ? '#000' : 'transparent'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {isCreating ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setIsCreating(false)
              }}
              placeholder="Group name..."
              className="px-3 py-1.5 border rounded text-sm text-black w-32"
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Add
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-t-lg transition-colors"
            title="Create new group"
          >
            + New Group
          </button>
        )}
      </div>
    </div>
  )
}
