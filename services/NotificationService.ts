
export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações desktop');
      return false;
    }

    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static send(title: string, body: string, icon?: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || 'https://cdn-icons-png.flaticon.com/512/2098/2098402.png',
        tag: 'thetask-deadline' // Evita spam agrupando notificações relacionadas
      });
    }
  }
}
