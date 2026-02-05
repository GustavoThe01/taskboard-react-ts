
import { Task } from '../types';

export class CalendarService {
  /**
   * Gera um link para adicionar a tarefa diretamente no Google Calendar via URL.
   */
  static generateGoogleCalendarUrl(task: Task): string {
    if (!task.dueDate) return '';

    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const title = encodeURIComponent(task.title);
    const details = encodeURIComponent(`${task.description}\n\nPrioridade: ${task.priority}\nStatus: ${task.status}\nGerado por ThéTask BETA`);
    
    // Formato ISO 8601 básico (YYYYMMDDTHHMMSSZ) sem hífens ou dois pontos para o Google
    const startDate = new Date(task.dueDate).toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(task.dueDate + 3600000).toISOString().replace(/-|:|\.\d+/g, ''); // +1 hora

    return `${baseUrl}&text=${title}&details=${details}&dates=${startDate}/${endDate}`;
  }
}
