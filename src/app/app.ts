import {
  Component
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  ConfirmDialog
} from './shared/components/confirm-dialog/confirm-dialog';

import {
  UserSwitcher
} from './shared/components/user-switcher/user-switcher';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    UserSwitcher,
    ConfirmDialog
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
