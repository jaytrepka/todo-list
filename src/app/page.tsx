import TodoList from "@/components/TodoList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Todo List</h1>
          <p className="text-gray-500">Organize your tasks by priority</p>
        </header>
        <main>
          <TodoList />
        </main>
      </div>
    </div>
  );
}

