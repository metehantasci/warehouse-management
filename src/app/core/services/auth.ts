import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import { AuthUser } from '../models/auth-user';
import { UserRole } from '../models/user-role.enum';
import { StorageService } from './storage';

interface DemoCredential {
  email: string;
  password: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly storage =
    inject(StorageService);

  private readonly sessionKey =
    'wms_v1_auth_session';

  private readonly currentUserState =
    signal<AuthUser | null>(
      this.storage.get<AuthUser>(this.sessionKey)
      ?? {
        id: 'user-operation-001',
        fullName: 'Operasyon Yöneticisi',
        email: 'operasyon@wms.local',
        role: UserRole.OPERASYON_YONETICISI,
        isActive: true
      }
    );

  readonly currentUser =
    this.currentUserState.asReadonly();

  readonly isAuthenticated = computed(
    () => this.currentUserState() !== null
  );

  readonly currentRole = computed(
    () => this.currentUserState()?.role ?? null
  );

  private readonly demoCredentials:
    readonly DemoCredential[] = [
      {
        email: 'depo@wms.local',
        password: '123456',
        user: {
          id: 'user-depo-001',
          fullName: 'Metehan Depo',
          email: 'depo@wms.local',
          role: UserRole.DEPO_SORUMLUSU,
          isActive: true
        }
      },
      {
        email: 'operasyon@wms.local',
        password: '123456',
        user: {
          id: 'user-operation-001',
          fullName: 'Operasyon Yöneticisi',
          email: 'operasyon@wms.local',
          role: UserRole.OPERASYON_YONETICISI,
          isActive: true
        }
      },
      {
        email: 'viewer@wms.local',
        password: '123456',
        user: {
          id: 'user-viewer-001',
          fullName: 'Görüntüleyici Kullanıcı',
          email: 'viewer@wms.local',
          role: UserRole.GORUNTULEYICI,
          isActive: true
        }
      }
    ];

  login(
    email: string,
    password: string
  ): AuthUser | null {
    const normalizedEmail =
      email.trim().toLowerCase();

    const credential =
      this.demoCredentials.find(
        item =>
          item.email.toLowerCase() === normalizedEmail &&
          item.password === password &&
          item.user.isActive
      );

    if (!credential) {
      return null;
    }

    const sessionUser: AuthUser = {
      ...credential.user
    };

    this.currentUserState.set(sessionUser);

    this.storage.set(
      this.sessionKey,
      sessionUser
    );

    return sessionUser;
  }

  logout(): void {
    this.currentUserState.set(null);
    this.storage.remove(this.sessionKey);
  }

  hasRole(
    roles: readonly UserRole[]
  ): boolean {
    const user = this.currentUserState();

    return !!user &&
      roles.includes(user.role);
  }

  setCurrentUserForDemo(
    user: AuthUser
  ): void {
    this.currentUserState.set(user);

    this.storage.set(
      this.sessionKey,
      user
    );
  }
}
