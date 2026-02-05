
export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum Status {
  TODO = 'A fazer',
  IN_PROGRESS = 'Em progresso',
  DONE = 'Concluído',
  BLOCKED = 'Bloqueado'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  tags: string[];
  createdAt: number;
  dueDate?: number;
}

export interface ProjectStats {
  total: number;
  completed: number;
  blocked: number;
  inProgress: number;
}
