
import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, Status, Priority } from './types';
import TaskCard from './components/TaskCard';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import Button from './components/Button';
import AiPlanner from './components/AiPlanner';
import { NotificationService } from './services/NotificationService';
import { useDeadlineChecker } from './hooks/useDeadlineChecker';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'board' | 'dashboard'>('board');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('zentask_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('zentask_theme', 'light');
    }
  };

  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  useDeadlineChecker(tasks);

  useEffect(() => {
    const saved = localStorage.getItem('zentask_pro_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Falha ao carregar tarefas");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zentask_pro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSaveTask = (task: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id);
      if (exists) {
        return prev.map(t => t.id === task.id ? task : t);
      }
      return [task, ...prev];
    });
    setIsAddingTask(false);
  };

  const addGeneratedTasks = (newTasks: Task[]) => setTasks(prev => [...newTasks, ...prev]);
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  
  const updateTaskStatus = (id: string, status: Status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = draggableId;
    const newStatus = destination.droppableId as Status;
    updateTaskStatus(taskId, newStatus);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = filterPriority === 'Todas' || t.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  const columns = [Status.TODO, Status.IN_PROGRESS, Status.DONE, Status.BLOCKED];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {/* Logo Customizada Profissional */}
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 z-10">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L17 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic">ThéTask <span className="text-indigo-600 dark:text-indigo-400 font-bold not-italic text-sm align-top ml-1">BETA</span></h1>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setView('board')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Quadro</button>
          <button onClick={() => setView('dashboard')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Dashboard</button>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Alternar Tema"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1m-16 0h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L5.121 5.121M19 12a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" placeholder="Pesquisar..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <Button variant="primary" onClick={() => setIsAddingTask(true)}>Nova Tarefa</Button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 pt-8 w-full">
        {view === 'dashboard' ? (
          <Dashboard tasks={tasks} isDarkMode={isDarkMode} />
        ) : (
          <>
            <AiPlanner onTasksGenerated={addGeneratedTasks} />
            <div className="flex items-center justify-between mb-6">
               <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                  {['Todas', ...Object.values(Priority)].map(p => (
                    <button 
                      key={p} 
                      onClick={() => setFilterPriority(p as any)} 
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterPriority === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800'}`}
                    >
                      Prioridade: {p}
                    </button>
                  ))}
               </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {columns.map(status => (
                  <div key={status} className="flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center uppercase text-xs tracking-widest">
                        <span className={`w-2 h-2 rounded-full mr-2 ${status === Status.DONE ? 'bg-green-500' : status === Status.IN_PROGRESS ? 'bg-amber-500' : status === Status.BLOCKED ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                        {status}
                        <span className="ml-2 text-[10px] text-slate-400">({filteredTasks.filter(t => t.status === status).length})</span>
                      </h2>
                    </div>
                    
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-4 p-2 rounded-2xl overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-slate-200/40 dark:bg-slate-900/40'}`}
                        >
                          {filteredTasks.filter(t => t.status === status).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(draggableProvided, draggableSnapshot) => (
                                <div
                                  ref={draggableProvided.innerRef}
                                  {...draggableProvided.draggableProps}
                                  {...draggableProvided.dragHandleProps}
                                  className={`${draggableSnapshot.isDragging ? 'z-50' : ''}`}
                                  style={{
                                    ...draggableProvided.draggableProps.style,
                                  }}
                                >
                                  <TaskCard 
                                    task={task} 
                                    onDelete={deleteTask} 
                                    onUpdateStatus={updateTaskStatus} 
                                    onUpdateTask={handleSaveTask}
                                    onClick={() => {}} // Edição agora é tratada internamente no card
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </>
        )}
      </main>

      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center">
            Desenvolvido com 
            <svg className="w-4 h-4 mx-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            por <span className="text-slate-700 dark:text-slate-200 font-bold ml-1">Gustavo Osterno Thé</span>
          </p>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://www.linkedin.com/in/gustavoosterno" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-400 hover:text-[#0A66C2] transition-colors group"
              title="LinkedIn"
            >
              <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:inline-block">LinkedIn</span>
            </a>
            
            <a 
              href="https://github.com/GustavoThe01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
              title="GitHub"
            >
              <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:inline-block">GitHub</span>
            </a>

            <a 
              href="https://www.instagram.com/gustavo.osterno/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-400 hover:text-[#E4405F] transition-colors group"
              title="Instagram"
            >
              <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:inline-block">Instagram</span>
            </a>
          </div>
        </div>
      </footer>

      {isAddingTask && (
        <TaskForm 
          onSave={handleSaveTask} 
          onClose={() => setIsAddingTask(false)} 
        />
      )}
    </div>
  );
};

export default App;
