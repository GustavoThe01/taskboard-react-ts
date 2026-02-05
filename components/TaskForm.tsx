
import React, { useState } from 'react';
import { Priority, Status, Task } from '../types';
import Button from './Button';
import { CalendarService } from '../services/CalendarService';

interface TaskFormProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  initialData?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSave, initialData }) => {
  const [syncWithCalendar, setSyncWithCalendar] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const desc = formData.get('description') as string;
    const priority = formData.get('priority') as Priority;
    const dueDateStr = formData.get('dueDate') as string;
    const tags = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t);
    
    if (!title) return;

    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : undefined;
    
    const taskData: Task = {
      id: initialData?.id || crypto.randomUUID(),
      title,
      description: desc,
      priority: priority || Priority.MEDIUM,
      status: initialData?.status || Status.TODO,
      tags: tags,
      createdAt: initialData?.createdAt || Date.now(),
      dueDate
    };

    onSave(taskData);

    // Se o usuário optou por sincronizar e existe uma data definida
    if (syncWithCalendar && dueDate) {
      const url = CalendarService.generateGoogleCalendarUrl(taskData);
      if (url) {
        window.open(url, '_blank');
      }
    }

    onClose();
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Título</label>
              <input 
                name="title" 
                autoFocus 
                required 
                defaultValue={initialData?.title}
                placeholder="O que precisa ser feito?" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
              <textarea 
                name="description" 
                rows={2} 
                defaultValue={initialData?.description}
                placeholder="Adicione contexto e detalhes..." 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                <select 
                  name="priority" 
                  defaultValue={initialData?.priority || Priority.MEDIUM}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Vencimento</label>
                <input 
                  name="dueDate" 
                  type="datetime-local" 
                  defaultValue={formatDateTime(initialData?.dueDate)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input 
                type="checkbox" 
                id="syncCalendar"
                checked={syncWithCalendar}
                onChange={(e) => setSyncWithCalendar(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
              />
              <label htmlFor="syncCalendar" className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                Incluir no Google Agenda ao salvar
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (separadas por vírgula)</label>
              <input 
                name="tags" 
                defaultValue={initialData?.tags.join(', ')}
                placeholder="dev, ops, design" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1">
                {initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
