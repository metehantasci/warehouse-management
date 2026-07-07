import {
  Component,
  signal
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  Header
} from '../header/header';

import {
  Sidebar
} from '../sidebar/sidebar';

import {
  Footer
} from '../footer/footer';


@Component({
  selector: 'app-main-layout',
  standalone: true,

  imports: [
    RouterOutlet,
    Header,
    Sidebar,
    Footer
  ],

  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

  readonly sidebarOpen =
    signal(false);


  toggleSidebar(): void {

    this.sidebarOpen.update(
      current => !current
    );
  }


  closeSidebar(): void {

    this.sidebarOpen.set(false);
  }
}
