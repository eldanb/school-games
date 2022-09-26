import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';


export type SendChatMessageDialogData = {
  recipientName: string;
  targetTerminal: string;
  lessonControllerProviderService: LessonControllerProviderService;
}

@Component({
  templateUrl: './send-chat-message-dialog.component.html',
  styleUrls: ['./send-chat-message-dialog.component.scss']
})
export class SendChatMessageDialogComponent implements OnInit {
  recipientName: string;
  targetTerminal: string;
  message: string;

  private _lessonControllerProviderService: LessonControllerProviderService;

  constructor(
    @Inject(MAT_DIALOG_DATA) dlgData: SendChatMessageDialogData,
    private _dlgRef: MatDialogRef<SendChatMessageDialogComponent>) {
    this.recipientName = dlgData.recipientName;
    this.targetTerminal = dlgData.targetTerminal;
    this._lessonControllerProviderService = dlgData.lessonControllerProviderService;
  }

  ngOnInit(): void {
  }

  async sendClicked() {
    const controller = await this._lessonControllerProviderService.getLessonController();
    await controller.sendMessage(this.targetTerminal, this.message);
    this._dlgRef.close();
  }
}
