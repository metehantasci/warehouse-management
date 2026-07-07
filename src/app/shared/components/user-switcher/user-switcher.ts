import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  AuthService
} from '../../../core/services/auth';

interface DemoUserOption {
  id: string;
  fullName: string;
  roleLabel: string;
  email: string;
}

@Component({
  selector: 'app-user-switcher',
  standalone: true,
  imports: [],
  templateUrl: './user-switcher.html',
  styleUrl: './user-switcher.scss'
})
export class UserSwitcher implements OnInit {
  readonly auth = inject(AuthService);

  readonly users:
    readonly DemoUserOption[] = [
      {
        id: 'user-depo-001',
        fullName: 'Metehan Depo',
        roleLabel: 'Depo Sorumlusu',
        email: 'depo@wms.local'
      },
      {
        id: 'user-operation-001',
        fullName: 'Operasyon Yöneticisi',
        roleLabel: 'Operasyon Yöneticisi',
        email: 'operasyon@wms.local'
      },
      {
        id: 'user-viewer-001',
        fullName: 'Görüntüleyici Kullanıcı',
        roleLabel: 'Görüntüleyici',
        email: 'viewer@wms.local'
      }
    ];

  ngOnInit(): void {
    if (this.auth.currentUser()) {
      return;
    }

    this.auth.login(
      'operasyon@wms.local',
      '123456'
    );
  }

  changeUser(event: Event): void {
    const target =
      event.target;

    if (
      !(
        target instanceof
        HTMLSelectElement
      )
    ) {
      return;
    }

    const user =
      this.users.find(
        item =>
          item.id === target.value
      );

    if (!user) {
      return;
    }

    this.auth.login(
      user.email,
      '123456'
    );
  }
}
