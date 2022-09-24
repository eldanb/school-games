import { AfterViewInit, Component, ComponentRef, OnInit, Self, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';



export class ConsoleUiFrameworkIntegrationSupportService {
  statusBarExtensionControlsContainer: Subject<ViewContainerRef | null>
    = new BehaviorSubject<ViewContainerRef | null>(null);
}


@Component({
  templateUrl: './console-ui-framework.component.html',
  styleUrls: ['./console-ui-framework.component.scss'],
  providers: [ConsoleUiFrameworkIntegrationSupportService]
})
export class ConsoleUiFrameworkComponent implements AfterViewInit {

  @ViewChild('statusBarExtensionControlsHost', {read: ViewContainerRef})
  statusBarExtensionControlsHost: ViewContainerRef;

  constructor(@Self() private _frameworkSupportService: ConsoleUiFrameworkIntegrationSupportService) {
  }


  ngAfterViewInit(): void {
    this._frameworkSupportService.statusBarExtensionControlsContainer.next(this.statusBarExtensionControlsHost);
  }


  public onActivateComponent(activatedComponent: any) {
  }


  public onDeactivateComponent(cr: any) {
    this.statusBarExtensionControlsHost.clear();
  }
}


export interface ConsoleUiFrameworkIntegrationSupport {
  readonly statusBarExtensionControls: TemplateRef<any>;
}
