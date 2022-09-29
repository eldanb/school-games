import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsoleGamePageHostComponent } from './main-console/console-game-page-host/console-game-page-host.component';
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
          path: 'g/:gameId',
          component: ConsoleGamePageHostComponent
        }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
