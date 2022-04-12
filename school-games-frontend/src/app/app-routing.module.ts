import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WordRoulettePageComponent } from './games/words-roulette/word-roulette-page/word-roulette-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/g/word-roulette'
  },
  {
    path: 'g/word-roulette',
    component: WordRoulettePageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
