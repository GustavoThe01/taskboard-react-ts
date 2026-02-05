
import React, { useState } from 'react';
import { Task, Priority, Status } from '../types';
import { suggestTaskOptimization } from '../services/geminiService';
import { CalendarService } from '../services/CalendarService';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onUpdateTask: (task: Task) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onUpdateStatus, onUpdateTask, onClick }) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isGettingAiHint, setIsGettingAiHint] = useState(false);

  // Estados locais para edição inline
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);

  const priorityColors = {
    [Priority.LOW]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [Priority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    [Priority.CRITICAL]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getAiHint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGettingAiHint(true);
    const hint = await suggestTaskOptimization(task);
    setSuggestion(hint);
    setIsGettingAiHint(false);
  };

  const handleSaveInline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    
    // Pequeno delay para a animação sutil ser percebida pelo usuário
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onUpdateTask({
      ...task,
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      dueDate: editDueDate
    });
    
    setIsSaving(false);
    setIsInlineEditing(false);
  };

  const handleCancelInline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate);
    setIsInlineEditing(false);
  };

  const formatDateTimeForInput = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== Status.DONE;
  const isNearDue = task.dueDate && (task.dueDate - Date.now()) < 3600000 && (task.dueDate - Date.now()) > 0 && task.status !== Status.DONE;

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = CalendarService.generateGoogleCalendarUrl(task);
    if (url) window.open(url, '_blank');
  };

  return (
    <div 
      onClick={() => !isInlineEditing && onClick(task)}
      className={`group bg-white dark:bg-slate-900 p-4 rounded-xl border transition-all relative shadow-sm hover:shadow-md 
        ${isInlineEditing ? 'ring-2 ring-indigo-500 border-transparent cursor-default' : 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.98]'} 
        ${isSaving ? 'animate-pulse bg-indigo-50/50 dark:bg-indigo-900/10' : ''}
        ${!isInlineEditing && isOverdue ? 'border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-800'}`}
    >
      <div className="flex justify-between items-start mb-2">
        {isInlineEditing ? (
          <select 
            disabled={isSaving}
            className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 border-none focus:ring-0 disabled:opacity-50"
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
          >
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        ) : (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        )}
        
        <div className="flex items-center space-x-1">
          {!isInlineEditing && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsInlineEditing(true); }}
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Editar inline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              {task.dueDate && (
                <button 
                  onClick={handleGoogleCalendar}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Adicionar ao Google Calendar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all"
                title="Excluir tarefa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
      
      {isInlineEditing ? (
        <div className="space-y-3 mt-2" onClick={(e) => e.stopPropagation()}>
          <input 
            disabled={isSaving}
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800 border-none rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título"
            autoFocus
          />
          <textarea 
            disabled={isSaving}
            className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-none rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none resize-none disabled:opacity-50"
            rows={2}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Descrição"
          />
          <input 
            disabled={isSaving}
            type="datetime-local"
            className="w-full text-[10px] bg-slate-50 dark:bg-slate-800 border-none rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
            value={formatDateTimeForInput(editDueDate)}
            onChange={(e) => setEditDueDate(e.target.value ? new Date(e.target.value).getTime() : undefined)}
          />
          <div className="flex gap-2 pt-1">
            <button 
              onClick={handleSaveInline}
              disabled={isSaving}
              className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center disabled:bg-emerald-800"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3 w-3 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SALVANDO...
                </>
              ) : 'SALVAR'}
            </button>
            <button 
              onClick={handleCancelInline}
              disabled={isSaving}
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold py-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              CANCELAR
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className={`font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isOverdue ? 'text-red-700 dark:text-red-400' : ''}`}>
            {task.title}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {task.description}
          </p>

          {task.dueDate && (
            <div className={`flex items-center text-[11px] font-medium mb-3 ${isOverdue ? 'text-red-600 dark:text-red-400' : isNearDue ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {new Date(task.dueDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {isOverdue && <span className="ml-2 font-bold uppercase tracking-tighter">Atrasado</span>}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 dark:border-slate-800">
            <select 
              className="text-[10px] font-medium bg-slate-50 dark:bg-slate-800 border-none rounded focus:ring-0 cursor-pointer text-slate-500 dark:text-slate-400"
              value={task.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateStatus(task.id, e.target.value as Status)}
            >
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <button 
              onClick={getAiHint}
              disabled={isGettingAiHint}
              title="Obter dica de eficiência da IA"
              className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              {isGettingAiHint ? (
                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
              )}
            </button>
          </div>
        </>
      )}

      {suggestion && (
        <div className="absolute top-full left-0 w-full z-10 mt-1 bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] p-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2">
          <p>{suggestion}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); setSuggestion(null); }}
            className="absolute top-1 right-1 hover:text-indigo-200"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
