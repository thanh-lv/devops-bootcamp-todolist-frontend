'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '@/lib/api';
import { CreateTodoInput, FilterStatus, Todo } from '@/lib/types';
import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';
import FilterBar from '@/components/FilterBar';

export default function Home() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch todos with filters
  const { data: todos, isLoading, error } = useQuery({
    queryKey: ['todos', filterStatus, searchQuery],
    queryFn: async () => {
      const filters: any = {};
      
      if (filterStatus === 'active') {
        filters.completed = false;
      } else if (filterStatus === 'completed') {
        filters.completed = true;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      return todoApi.getAllTodos(filters);
    },
  });

  // Create todo mutation
  const createMutation = useMutation({
    mutationFn: (newTodo: CreateTodoInput) => todoApi.createTodo(newTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Toggle todo mutation
  const toggleMutation = useMutation({
    mutationFn: (id: number) => todoApi.toggleTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Delete todo mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleCreateTodo = (todo: CreateTodoInput) => {
    createMutation.mutate(todo);
  };

  const handleToggleTodo = (id: number) => {
    toggleMutation.mutate(id);
  };

  const handleDeleteTodo = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo List CI/CD TEST demo v2</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </header>

        <TodoForm onSubmit={handleCreateTodo} />

        <FilterBar
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading todos</p>
            <p className="text-sm mt-1">Please make sure the backend server is running.</p>
          </div>
        ) : todos && todos.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {filterStatus === 'all' ? 'All Todos' : 
               filterStatus === 'active' ? 'Active Todos' : 'Completed Todos'}
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({todos.length} {todos.length === 1 ? 'item' : 'items'})
              </span>
            </h2>
            {todos.map((todo: Todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-600 font-medium">No todos found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search query' : 'Create one to get started!'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
