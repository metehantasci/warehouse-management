import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  ReportFacadeService
} from '../../services/report-facade';


@Component({
  selector: 'app-reports',
  standalone: true,

  imports: [],

  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports
  implements OnInit {

  readonly report =
    inject(ReportFacadeService);


  ngOnInit(): void {

    this.report.load();
  }


  formatNumber(
    value: number
  ): string {

    return new Intl
      .NumberFormat(
        'tr-TR'
      )
      .format(value);
  }
}
