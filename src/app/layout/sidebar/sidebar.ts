import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  UserRole
} from '../../core/models/user-role.enum';

import {
  AuthService
} from '../../core/services/auth';


interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}


@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

  @Input()
  open = false;


  @Output()
  readonly closeSidebar =
    new EventEmitter<void>();


  readonly auth =
    inject(AuthService);


  readonly mainItems:
    SidebarItem[] = [

      {
        label: 'Dashboard',
        icon: '▦',
        route: '/dashboard'
      },

      {
        label: 'Ürünler',
        icon: '□',
        route: '/urunler'
      },

      {
        label: 'Depolar',
        icon: '⌂',
        route: '/depolar'
      },

      {
        label: 'Stok Hareketleri',
        icon: '↕',
        route: '/stok-hareketleri'
      },

      {
        label: 'Transferler',
        icon: '⇄',
        route: '/transferler'
      },

      {
        label: 'Sevkiyatlar',
        icon: '▰',
        route: '/sevkiyatlar'
      }
    ];


  readonly analysisItems:
    SidebarItem[] = [

      {
        label: 'Kritik Stok',
        icon: '!',
        route: '/kritik-stok'
      },

      {
        label: 'Raporlar',
        icon: '▥',
        route: '/raporlar'
      }
    ];


  get canSeeAuditLog():
    boolean {

    return (
      this.auth
        .currentUser()
        ?.role
      ===
      UserRole.OPERASYON_YONETICISI
    );
  }


  close(): void {

    this.closeSidebar.emit();
  }
}
