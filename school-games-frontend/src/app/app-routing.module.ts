import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LessonControllerProviderComponent } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.component';
import { WordRoulettePageComponent } from './games/words-roulette/word-roulette-page/word-roulette-page.component';
import { ConsoleMainViewComponent } from './main-console/console-main-view/console-main-view.component';
import { ConsoleUiFrameworkComponent } from './main-console/console-ui-framework/console-ui-framework.component';
import { TerminalMainPageComponent } from './terminal/terminal-main-page/terminal-main-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/c/menu',
  },

  {
    path: 't',
    component: TerminalMainPageComponent,
  },

  {
    path: 'c',
    component: ConsoleUiFrameworkComponent,
    children: [
        {
          path: 'menu',
          component: ConsoleMainViewComponent
        },
        {
          path: 'g/word-roulette',
          component: WordRoulettePageComponent
        },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
