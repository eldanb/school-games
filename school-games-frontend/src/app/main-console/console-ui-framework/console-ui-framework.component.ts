import { AfterViewInit, Component, Injectable, Self, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ConsoleUiFrameworkIntegrationSupportService {
  private _component: ConsoleUiFrameworkComponent;

  connectConsoleUiFrameworkComponent(component: ConsoleUiFrameworkComponent) {
    this._component = component;
  }

  statusBarExtensionControlsContainer: Subject<ViewContainerRef | null>
    = new BehaviorSubject<ViewContainerRef | null>(null);

  get pageTitle(): string {
    return this._component.pageTitle;
  }

  set pageTitle(v: string) {
    this._component.pageTitle = v;
  }
}


@Component({
  templateUrl: './console-ui-framework.component.html',
  styleUrls: ['./console-ui-framework.component.scss'],
  providers: [ConsoleUiFrameworkIntegrationSupportService]
})
export class ConsoleUiFrameworkComponent implements AfterViewInit {

  public pageTitle: string;

  @ViewChild('statusBarExtensionControlsHost', {read: ViewContainerRef})
  statusBarExtensionControlsHost: ViewContainerRef;

  constructor(@Self() private _frameworkSupportService: ConsoleUiFrameworkIntegrationSupportService) {
    this._frameworkSupportService.connectConsoleUiFrameworkComponent(this);
  }


  ngAfterViewInit(): void {
    this._frameworkSupportService.statusBarExtensionControlsContainer.next(this.statusBarExtensionControlsHost);
  }


  public onActivateComponent(activatedComponent: any) {
  }


  public onDeactivateComponent(cr: any) {
    this.statusBarExtensionControlsHost.clear();
    this.pageTitle = "";
  }
}


export interface ConsoleUiFrameworkIntegrationSupport {
  readonly statusBarExtensionControls: TemplateRef<any>;
}
