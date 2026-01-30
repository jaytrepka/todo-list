'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import TodoCard from './TodoCard'
import AddTodoForm from './AddTodoForm'
import GroupTabs from './GroupTabs'
import { Todo, Group, Priority } from '@/lib/types'

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroupId, setActiveGroupId] = useState('common')
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(['high', 'medium', 'low'])
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get unique assignees from all todos
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>()
    todos.forEach((t) => {
      if (t.responsible) assignees.add(t.responsible)
    })
    return Array.from(assignees).sort()
  }, [todos])

  const fetchGroups = useCallback(async () => {
    const res = await fetch('/api/groups')
    const data = await res.json()
    setGroups(data)
  }, [])

  const fetchTodos = useCallback(async () => {
    const params = new URLSearchParams({
      showCompleted: String(showCompleted),
      groupId: activeGroupId,
    })
    if (selectedPriorities.length < 3) {
      params.set('priorities', selectedPriorities.join(','))
    }
    if (selectedAssignee) {
      params.set('assignee', selectedAssignee)
    }
    
    const res = await fetch(`/api/todos?${params}`)
    const data = await res.json()
    setTodos(data)
    setLoading(false)
  }, [showCompleted, activeGroupId, selectedPriorities, selectedAssignee])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id)
      const newIndex = todos.findIndex((t) => t.id === over.id)
      const newTodos = arrayMove(todos, oldIndex, newIndex)
      setTodos(newTodos)

      await fetch('/api/todos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newTodos.map((t) => t.id) }),
      })
    }
  }

  const handleAddTodo = async (data: { title: string; description: string; priority: Priority; responsible: string; deadline: string }) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, groupId: activeGroupId }),
    })
    const newTodo = await res.json()
    setTodos([...todos, newTodo])
  }

  const handleUpdateTodo = async (id: string, data: Partial<Todo>) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updatedTodo = await res.json()
    
    if (data.completed && !showCompleted) {
      setTodos(todos.filter((t) => t.id !== id))
    } else {
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)))
    }
  }

  const handleDeleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    setTodos(todos.filter((t) => t.id !== id))
  }

  const handleAddComment = async (todoId: string, content: string, author: string) => {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoId, content, author }),
    })
    const newComment = await res.json()
    setTodos(
      todos.map((t) =>
        t.id === todoId ? { ...t, comments: [...t.comments, newComment] } : t
      )
    )
  }

  const handleEditComment = async (commentId: string, content: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const updatedComment = await res.json()
    setTodos(
      todos.map((t) => ({
        ...t,
        comments: t.comments.map((c) => (c.id === commentId ? updatedComment : c)),
      }))
    )
  }

  const handleDeleteComment = async (commentId: string, todoId: string) => {
    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    setTodos(
      todos.map((t) =>
        t.id === todoId ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) } : t
      )
    )
  }

  const handleCreateGroup = async (name: string) => {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const newGroup = await res.json()
    setGroups([...groups, newGroup])
    setActiveGroupId(newGroup.id)
  }

  const handleRenameGroup = async (id: string, name: string) => {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const updatedGroup = await res.json()
    setGroups(groups.map((g) => (g.id === id ? updatedGroup : g)))
  }

  const handleChangeGroupColor = async (id: string, color: string) => {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color }),
    })
    const updatedGroup = await res.json()
    setGroups(groups.map((g) => (g.id === id ? updatedGroup : g)))
  }

  const handleDeleteGroup = async (id: string) => {
    await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    setGroups(groups.filter((g) => g.id !== id))
    setActiveGroupId('common')
  }

  const handlePriorityToggle = (priority: Priority) => {
    if (selectedPriorities.includes(priority)) {
      if (selectedPriorities.length > 1) {
        setSelectedPriorities(selectedPriorities.filter((p) => p !== priority))
      }
    } else {
      setSelectedPriorities([...selectedPriorities, priority])
    }
  }

  // Sort by priority for display
  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Group Tabs */}
      <GroupTabs
        groups={groups}
        activeGroupId={activeGroupId}
        onSelectGroup={setActiveGroupId}
        onCreateGroup={handleCreateGroup}
        onRenameGroup={handleRenameGroup}
        onChangeGroupColor={handleChangeGroupColor}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          {/* Show completed */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-gray-600 text-sm">Show completed</span>
          </label>

          <span className="text-gray-300">|</span>

          {/* Priority filters */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Priority:</span>
            {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
              <label key={priority} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPriorities.includes(priority)}
                  onChange={() => handlePriorityToggle(priority)}
                  className={`w-4 h-4 ${
                    priority === 'high' ? 'accent-red-500' :
                    priority === 'medium' ? 'accent-yellow-500' : 'accent-green-500'
                  }`}
                />
                <span className={`text-sm capitalize ${
                  priority === 'high' ? 'text-red-600' :
                  priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {priority}
                </span>
              </label>
            ))}
          </div>

          <span className="text-gray-300">|</span>

          {/* Assignee filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Assignee:</span>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="p-1 border rounded text-sm text-black"
            >
              <option value="">All</option>
              {allAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-300">|</span>

          <span className="text-gray-500 text-sm">
            {todos.length} todo{todos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Add Todo Form */}
      <div className="mb-6">
        <AddTodoForm onAdd={handleAddTodo} />
      </div>

      {/* Priority Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-400"></span> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-400"></span> Low
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-400"></span> Due soon
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-600"></span> Overdue
        </span>
      </div>

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">No todos in this group yet!</p>
          <p>Add your first todo above.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
