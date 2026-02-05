
import { useEffect, useRef } from 'react';
import { Task, Status } from '../types';
import { NotificationService } from '../services/NotificationService';

export const useDeadlineChecker = (tasks: Task[]) => {
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkDeadlines = () => {
      const now = Date.now();
      const THRESHOLD_MS = 30 * 60 * 1000; // 30 minutos

      tasks.forEach(task => {
        if (
          task.dueDate && 
          task.status !== Status.DONE && 
          !notifiedTasks.current.has(task.id)
        ) {
          const timeLeft = task.dueDate - now;

          // Se faltar menos de 30 min e ainda não venceu
          if (timeLeft > 0 && timeLeft < THRESHOLD_MS) {
            NotificationService.send(
              'Tarefa Próxima do Vencimento!',
              `A tarefa "${task.title}" vence em breve (${Math.round(timeLeft / 60000)} min).`
            );
            notifiedTasks.current.add(task.id);
          }
          
          // Se já venceu (e não foi notificado como atrasado ainda)
          if (timeLeft <= 0 && !notifiedTasks.current.has(`${task.id}-late`)) {
            NotificationService.send(
              'Tarefa Atrasada!',
              `A tarefa "${task.title}" ultrapassou o prazo de entrega.`
            );
            notifiedTasks.current.add(`${task.id}-late`);
          }
        }
      });
    };

    const interval = setInterval(checkDeadlines, 60000); // Checa a cada minuto
    checkDeadlines(); // Checagem inicial

    return () => clearInterval(interval);
  }, [tasks]);
};
