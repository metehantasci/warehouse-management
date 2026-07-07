import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardFacadeService } from '../../services/dashboard-facade';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  readonly dashboard = inject(DashboardFacadeService);
  ngOnInit(): void { this.dashboard.load(); }
  formatNumber(value: number): string { return new Intl.NumberFormat('tr-TR').format(value); }
}