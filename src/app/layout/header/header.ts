import {
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import {
  UserRole
} from '../../core/models/user-role.enum';

import {
  AuthService
} from '../../core/services/auth';

import {
  NotificationCenter
} from '../../shared/components/notification-center/notification-center';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NotificationCenter
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  readonly auth =
    inject(AuthService);

  @Output()
  readonly menuToggle =
    new EventEmitter<void>();

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  initials(): string {
    const name =
      this.auth
        .currentUser()
        ?.fullName
        .trim();

    if (!name) {
      return 'U';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(
        part =>
          part.charAt(0)
      )
      .join('')
      .toLocaleUpperCase(
        'tr-TR'
      );
  }

  roleLabel(): string {
    const role =
      this.auth.currentRole();

    switch (role) {
      case UserRole.DEPO_SORUMLUSU:
        return 'DEPO SORUMLUSU';

      case UserRole.OPERASYON_YONETICISI:
        return 'OPERASYON YÖNETİCİSİ';

      case UserRole.GORUNTULEYICI:
        return 'GÖRÜNTÜLEYİCİ';

      default:
        return 'ROL YOK';
    }
  }
}
