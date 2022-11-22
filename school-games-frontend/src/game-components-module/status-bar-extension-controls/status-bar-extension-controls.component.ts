import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ConsoleUiFrameworkIntegrationSupportService } from 'src/app/main-console/console-ui-framework/console-ui-framework.component';

@Component({
  selector: 'app-status-bar-extension-controls',
  templateUrl: './status-bar-extension-controls.component.html',
  styleUrls: ['./status-bar-extension-controls.component.scss']
})
export class StatusBarExtensionControlsComponent implements OnInit {

  @ViewChild("statusBarExtensionControls", { read: TemplateRef })
  private _statusBarExtensionControls: TemplateRef<any>;

  constructor(private _consoleUiFramework: ConsoleUiFrameworkIntegrationSupportService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this._consoleUiFramework.statusBarExtensionControlsContainer.subscribe((cr) => cr?.createEmbeddedView(this._statusBarExtensionControls))
  }

}
