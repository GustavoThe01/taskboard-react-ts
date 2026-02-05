
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import { Task, Status, Priority } from '../types';

interface ProductivityAnalysisProps {
  tasks: Task[];
  isDarkMode: boolean;
}

const ProductivityAnalysis: React.FC<ProductivityAnalysisProps> = ({ tasks, isDarkMode }) => {
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === Status.DONE);
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();

      return {
        name: dateStr,
        concluidas: completedTasks.filter(t => t.createdAt >= dayStart && t.createdAt <= dayEnd).length,
        criadas: tasks.filter(t => t.createdAt >= dayStart && t.createdAt <= dayEnd).length
      };
    });

    const priorityEfficiency = Object.values(Priority).map(p => ({
      priority: p,
      count: completedTasks.filter(t => t.priority === p).length
    }));

    return { completionRate, last7Days, priorityEfficiency, completedCount: completedTasks.length };
  }, [tasks]);

  const COLORS = {
    [Priority.LOW]: '#94a3b8',
    [Priority.MEDIUM]: '#f59e0b',
    [Priority.HIGH]: '#ef4444',
    [Priority.CRITICAL]: '#7f1d1d',
  };

  const textFill = isDarkMode ? '#94a3b8' : '#64748b';
  const gridStroke = isDarkMode ? '#334155' : '#f1f5f9';

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
          <h4 className="text-indigo-100 text-sm font-medium mb-1">Taxa de Entrega</h4>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold">{stats.completionRate}%</span>
            <span className="text-indigo-200 text-xs mb-1">{stats.completedCount} de {tasks.length} tarefas</span>
          </div>
          <div className="mt-4 w-full bg-indigo-900/40 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Velocidade Semanal
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.last7Days}>
                <defs>
                  <linearGradient id="colorCriadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: textFill}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f1f5f9' : '#1e293b'
                  }}
                />
                <Area type="monotone" dataKey="criadas" stroke="#6366f1" fillOpacity={1} fill="url(#colorCriadas)" strokeWidth={2} name="Criadas" />
                <Area type="monotone" dataKey="concluidas" stroke="#10b981" fillOpacity={0} strokeWidth={2} name="Concluídas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Entregas por Prioridade
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.priorityEfficiency} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="priority" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: textFill}} width={80} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {stats.priorityEfficiency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.priority as Priority] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductivityAnalysis;
