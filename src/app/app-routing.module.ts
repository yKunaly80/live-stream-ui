import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path:'',
    redirectTo:'live-class',
    pathMatch:'full'
},
{
    path: 'live-class',
    loadComponent: () => import('./live-class/live-class.component').then(c => c.LiveClassComponent)
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
