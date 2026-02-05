
import React from 'react';
import Button from './Button';
import { decomposeGoalIntoTasks } from '../services/geminiService';
import { Priority, Status, Task } from '../types';

interface AiPlannerProps {
  onTasksGenerated: (newTasks: Task[]) => void;
}

const AiPlanner: React.FC<AiPlannerProps> = ({ onTasksGenerated }) => {
  const [goal, setGoal] = React.useState('');
  const [isPlanning, setIsPlanning] = React.useState(false);

  const handleDecompose = async () => {
    if (!goal.trim()) return;
    setIsPlanning(true);
    try {
      const partialTasks = await decomposeGoalIntoTasks(goal);
      const fullTasks: Task[] = partialTasks.map(pt => ({
        id: crypto.randomUUID(),
        title: pt.title || 'Nova Tarefa',
        description: pt.description || '',
        priority: pt.priority as Priority || Priority.MEDIUM,
        status: Status.TODO,
        tags: pt.tags || ['gerado-por-ia'],
        createdAt: Date.now()
      }));
      onTasksGenerated(fullTasks);
      setGoal('');
    } catch (err: any) {
      const message = err.message || "Erro desconhecido";
      if (message.includes("API Key")) {
        alert("⚠️ CONFIGURAÇÃO NECESSÁRIA:\n\n" + message);
      } else {
        alert("Erro ao conectar com a IA. Verifique o console para mais detalhes.\n\nDetalhe: " + message);
      }
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-6 rounded-2xl mb-8">
      <div className="flex items-start mb-4">
        <div className="bg-indigo-600 p-2 rounded-lg text-white mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Precisando de ajuda da IA?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Insira um objetivo macro e deixe o Gemini dividi-lo em tarefas profissionais acionáveis.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Ex: Criar um sistema de autenticação pronto para produção com OAuth2"
          className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleDecompose()}
        />
        <Button 
          variant="ai" 
          size="lg" 
          onClick={handleDecompose} 
          isLoading={isPlanning}
        >
          {isPlanning ? 'Analisando...' : 'Sugerir Objetivo'}
        </Button>
      </div>
    </div>
  );
};

export default AiPlanner;
