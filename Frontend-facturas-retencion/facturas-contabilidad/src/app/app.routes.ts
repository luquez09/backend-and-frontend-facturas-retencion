import { Routes } from '@angular/router';
import { InvoiceAuditDashboardComponent } from './features/invoice-audit/page/invoice-audit-dashboard/invoice-audit-dashboard.component';
export const routes: Routes = [
  {
    path: '',
    component: InvoiceAuditDashboardComponent,
    pathMatch: 'full'
  },
  {
    path: 'invoice-audit-dashboard',
    component: InvoiceAuditDashboardComponent
  }
];
