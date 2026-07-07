import {
  Injectable,
  computed,
  signal
} from '@angular/core';

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
  createdAt: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly storageKey =
    'wms_v1_notifications';

  private readonly maxHistory =
    80;

  private readonly notificationState =
    signal<AppNotification[]>(
      this.loadHistory()
    );

  private readonly toastState =
    signal<AppNotification[]>([]);

  readonly notifications =
    this.notificationState.asReadonly();

  readonly toasts =
    this.toastState.asReadonly();

  readonly unreadCount =
    computed(
      () =>
        this.notificationState()
          .filter(
            item => !item.read
          )
          .length
    );

  readonly hasUnread =
    computed(
      () =>
        this.unreadCount() > 0
    );

  success(
    message: string,
    title = 'Başarılı',
    duration = 3500
  ): void {
    this.push(
      'success',
      title,
      message,
      duration
    );
  }

  error(
    message: string,
    title = 'Hata',
    duration = 5000
  ): void {
    this.push(
      'error',
      title,
      message,
      duration
    );
  }

  warning(
    message: string,
    title = 'Uyarı',
    duration = 4500
  ): void {
    this.push(
      'warning',
      title,
      message,
      duration
    );
  }

  info(
    message: string,
    title = 'Bilgi',
    duration = 3500
  ): void {
    this.push(
      'info',
      title,
      message,
      duration
    );
  }

  markAsRead(
    id: string
  ): void {
    this.notificationState.update(
      items =>
        items.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  read: true
                }
              : item
        )
    );

    this.persist();
  }

  markAllAsRead(): void {
    this.notificationState.update(
      items =>
        items.map(
          item => ({
            ...item,
            read: true
          })
        )
    );

    this.persist();
  }

  remove(
    id: string
  ): void {
    this.notificationState.update(
      items =>
        items.filter(
          item =>
            item.id !== id
        )
    );

    this.dismissToast(id);
    this.persist();
  }

  clear(): void {
    this.notificationState.set([]);
    this.toastState.set([]);
    this.persist();
  }

  dismissToast(
    id: string
  ): void {
    this.toastState.update(
      items =>
        items.filter(
          item =>
            item.id !== id
        )
    );
  }

  private push(
    type: NotificationType,
    title: string,
    message: string,
    duration: number
  ): void {
    const notification:
      AppNotification = {
        id:
          this.createId(),

        type,
        title,
        message,
        duration,

        createdAt:
          new Date().toISOString(),

        read: false
      };

    this.notificationState.update(
      items =>
        [
          notification,
          ...items
        ]
          .slice(
            0,
            this.maxHistory
          )
    );

    this.toastState.update(
      items => [
        notification,
        ...items
      ].slice(0, 4)
    );

    this.persist();

    if (
      duration > 0
      &&
      typeof window !== 'undefined'
    ) {
      window.setTimeout(
        () =>
          this.dismissToast(
            notification.id
          ),
        duration
      );
    }
  }

  private loadHistory():
    AppNotification[] {
    if (
      typeof localStorage ===
      'undefined'
    ) {
      return [];
    }

    try {
      const raw =
        localStorage.getItem(
          this.storageKey
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(
          item =>
            item
            &&
            typeof item.id ===
              'string'
            &&
            typeof item.message ===
              'string'
        )
        .map(
          item => ({
            id:
              String(item.id),

            type:
              this.normalizeType(
                item.type
              ),

            title:
              typeof item.title ===
                'string'
                ? item.title
                : 'Bildirim',

            message:
              String(item.message),

            duration:
              Number.isFinite(
                Number(item.duration)
              )
                ? Number(item.duration)
                : 4000,

            createdAt:
              typeof item.createdAt ===
                'string'
                ? item.createdAt
                : new Date()
                    .toISOString(),

            read:
              Boolean(item.read)
          })
        )
        .slice(
          0,
          this.maxHistory
        );
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (
      typeof localStorage ===
      'undefined'
    ) {
      return;
    }

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          this.notificationState()
        )
      );
    } catch {
      // Bildirim geçmişi yazılamazsa
      // uygulamanın ana akışını bozma.
    }
  }

  private normalizeType(
    value: unknown
  ): NotificationType {
    switch (value) {
      case 'success':
      case 'error':
      case 'warning':
      case 'info':
        return value;

      default:
        return 'info';
    }
  }

  private createId(): string {
    return [
      Date.now().toString(36),
      Math.random()
        .toString(36)
        .slice(2, 9)
    ].join('-');
  }
}
