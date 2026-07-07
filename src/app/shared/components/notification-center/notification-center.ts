import {
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  AppNotification,
  NotificationService,
  NotificationType
} from '../../../core/services/notification';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [],
  templateUrl:
    './notification-center.html',
  styleUrl:
    './notification-center.scss'
})
export class NotificationCenter {
  readonly notification =
    inject(NotificationService);

  readonly panelOpen =
    signal(false);

  readonly visibleItems =
    computed(
      () =>
        this.notification
          .notifications()
          .slice(0, 30)
    );

  togglePanel(): void {
    this.panelOpen.update(
      value => !value
    );
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  markRead(
    item: AppNotification
  ): void {
    if (!item.read) {
      this.notification
        .markAsRead(item.id);
    }
  }

  markAllRead(): void {
    this.notification
      .markAllAsRead();
  }

  clearAll(): void {
    const confirmed =
      window.confirm(
        'Tüm bildirim geçmişi temizlensin mi?'
      );

    if (!confirmed) {
      return;
    }

    this.notification.clear();
  }

  removeItem(
    event: Event,
    id: string
  ): void {
    event.stopPropagation();

    this.notification.remove(id);
  }

  dismissToast(
    id: string
  ): void {
    this.notification
      .dismissToast(id);
  }

  iconFor(
    type: NotificationType
  ): string {
    switch (type) {
      case 'success':
        return '✓';

      case 'error':
        return '!';

      case 'warning':
        return '!';

      case 'info':
      default:
        return 'i';
    }
  }

  timeAgo(
    value: string
  ): string {
    const timestamp =
      new Date(value).getTime();

    if (
      !Number.isFinite(timestamp)
    ) {
      return '';
    }

    const seconds =
      Math.max(
        0,
        Math.floor(
          (
            Date.now()
            -
            timestamp
          )
          /
          1000
        )
      );

    if (seconds < 60) {
      return 'Az önce';
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (minutes < 60) {
      return `${minutes} dk önce`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} sa önce`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return `${days} gün önce`;
    }

    return new Intl
      .DateTimeFormat(
        'tr-TR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      )
      .format(
        new Date(value)
      );
  }

  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {
    this.closePanel();
  }
}
