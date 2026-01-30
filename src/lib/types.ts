export type Priority = 'high' | 'medium' | 'low'

export interface Group {
  id: string
  name: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  author: string | null
  createdAt: string
  todoId: string
}

export interface Todo {
  id: string
  title: string
  description: string | null
  priority: Priority
  completed: boolean
  position: number
  responsible: string | null
  createdAt: string
  solvedAt: string | null
  groupId: string | null
  comments: Comment[]
}

export const priorityColors: Record<Priority, string> = {
  high: 'bg-red-100 border-red-400 hover:bg-red-50',
  medium: 'bg-yellow-100 border-yellow-400 hover:bg-yellow-50',
  low: 'bg-green-100 border-green-400 hover:bg-green-50',
}

export const priorityBadgeColors: Record<Priority, string> = {
  high: 'bg-red-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-green-500 text-white',
}
