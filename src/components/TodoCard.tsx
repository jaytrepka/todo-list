'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Todo, Priority, priorityColors, priorityBadgeColors, Comment } from '@/lib/types'

interface TodoCardProps {
  todo: Todo
  onUpdate: (id: string, data: Partial<Todo>) => void
  onDelete: (id: string) => void
  onAddComment: (todoId: string, content: string, author: string) => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string, todoId: string) => void
}

function getDeadlineStatus(deadline: string | null): { isUrgent: boolean; isOverdue: boolean; daysLeft: number | null } {
  if (!deadline) return { isUrgent: false, isOverdue: false, daysLeft: null }
  
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(23, 59, 59, 999)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const diffTime = deadlineDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    isUrgent: daysLeft <= 2 && daysLeft >= 0,
    isOverdue: daysLeft < 0,
    daysLeft,
  }
}

export default function TodoCard({ todo, onUpdate, onDelete, onAddComment, onEditComment, onDeleteComment }: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
    responsible: todo.responsible || '',
    deadline: todo.deadline ? todo.deadline.split('T')[0] : '',
  })
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const deadlineStatus = getDeadlineStatus(todo.deadline)

  const handleSave = () => {
    onUpdate(todo.id, {
      ...editData,
      deadline: editData.deadline || null,
    } as Partial<Todo>)
    setIsEditing(false)
  }

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed })
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(todo.id, newComment, commentAuthor)
      setNewComment('')
      setCommentAuthor('')
    }
  }

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  const handleSaveComment = () => {
    if (editingCommentId && editingCommentContent.trim()) {
      onEditComment(editingCommentId, editingCommentContent)
      setEditingCommentId(null)
      setEditingCommentContent('')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDeadline = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getCardClasses = () => {
    if (todo.completed) return `${priorityColors[todo.priority as Priority]} opacity-60`
    if (deadlineStatus.isOverdue) return 'bg-red-200 border-red-600 hover:bg-red-100 ring-2 ring-red-500'
    if (deadlineStatus.isUrgent) return 'bg-orange-200 border-orange-500 hover:bg-orange-100 ring-2 ring-orange-400'
    return priorityColors[todo.priority as Priority]
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-lg p-4 mb-3 ${getCardClasses()}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="w-5 h-5 mt-1 cursor-pointer accent-green-600"
        />

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full p-2 border rounded text-black"
                placeholder="Title"
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full p-2 border rounded text-black"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value as Priority })}
                  className="p-2 border rounded text-black"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="text"
                  value={editData.responsible}
                  onChange={(e) => setEditData({ ...editData, responsible: e.target.value })}
                  className="flex-1 min-w-32 p-2 border rounded text-black"
                  placeholder="Responsible person"
                />
                <input
                  type="date"
                  value={editData.deadline}
                  onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  className="p-2 border rounded text-black"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {todo.title}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${priorityBadgeColors[todo.priority as Priority]}`}>
                  {todo.priority}
                </span>
                {todo.responsible && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    👤 {todo.responsible}
                  </span>
                )}
                {todo.deadline && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    deadlineStatus.isOverdue 
                      ? 'bg-red-600 text-white' 
                      : deadlineStatus.isUrgent 
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                  }`}>
                    📅 {formatDeadline(todo.deadline)}
                    {deadlineStatus.isOverdue && ' (Overdue!)'}
                    {deadlineStatus.isUrgent && !deadlineStatus.isOverdue && ` (${deadlineStatus.daysLeft}d left)`}
                  </span>
                )}
              </div>
              {todo.description && (
                <p className="text-gray-600 mt-1 text-sm">{todo.description}</p>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Created: {formatDate(todo.createdAt)}
                {todo.solvedAt && <span className="ml-3">Solved: {formatDate(todo.solvedAt)}</span>}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Comments"
            >
              💬 {todo.comments.length}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-1 text-red-500 hover:text-red-700"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <h4 className="font-medium text-gray-700 mb-2">Comments</h4>
          {todo.comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet</p>
          ) : (
            <div className="space-y-2 mb-3">
              {todo.comments.map((comment) => (
                <div key={comment.id} className="bg-white/50 p-2 rounded text-sm group">
                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="flex-1 p-1 border rounded text-black text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveComment()
                          if (e.key === 'Escape') setEditingCommentId(null)
                        }}
                        autoFocus
                      />
                      <button onClick={handleSaveComment} className="text-green-600 hover:text-green-800">✓</button>
                      <button onClick={() => setEditingCommentId(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <p className="text-gray-800">{comment.content}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEditComment(comment)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this comment?')) {
                                onDeleteComment(comment.id, todo.id)
                              }
                            }}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.author || 'Anonymous'} • {formatDate(comment.createdAt)}
                        {comment.updatedAt !== comment.createdAt && ' (edited)'}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              className="w-24 p-2 border rounded text-sm text-black"
              placeholder="Name"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 p-2 border rounded text-sm text-black"
              placeholder="Add a comment..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
