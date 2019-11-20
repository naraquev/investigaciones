import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalificationComponent } from './calification/calification.component';
import { ResultsComponent } from './results/results.component';
import { ExtractComponent } from './extract/extract.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // { path: '', redirectTo: '/results', pathMatch: 'full' },
  // {
  //   path: 'calification',
  //   component: CalificationComponent,
  //   canActivate: [AuthGuard]
  // },
  { path: '', component: ResultsComponent },
  // { path: 'extract', component: ExtractComponent, canActivate: [AuthGuard] },
  { path: 'privacy-policy', component: PrivacyPolicyComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
