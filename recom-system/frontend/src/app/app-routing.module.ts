import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SelectionComponent } from './components/selection/selection.component';
import { RecomendationComponent } from './components/recomendation/recomendation.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    children: [
      { path: '', component: HomeComponent },
    ]
  },
  {
    path: 'prediction',
    children: [
      { path: ':selection', component: SelectionComponent },
    ]
  },
  {
    path: 'recomendation',
    children: [
      { path: '', component: RecomendationComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
