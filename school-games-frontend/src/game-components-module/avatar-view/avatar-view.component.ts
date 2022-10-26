import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { TerminalAvatar } from 'school-games-common';

@Component({
  selector: 'app-avatar-view',
  templateUrl: './avatar-view.component.html',
  styleUrls: ['./avatar-view.component.scss']
})
export class AvatarViewComponent implements OnInit {

  constructor() { }

  @Input()
  avatar: TerminalAvatar | null;

  @Input()
  size: "small" | "medium" | "big";

  ngOnInit(): void {
  }

  get spriteRef(): string | null {
    return this.avatar && AvatarViewComponent.getSpriteRef(this.avatar.avatarName);
  }

  static getSpriteRef(avaterName: string): string {
    return `/frontend/assets/avatars.svg#sprite-${avaterName}`;
  }

  static allAvatarNames() {
    return require.context('src/avatars', false, /.*\.svg$/, 'weak')
      .keys()
      .filter(k => k.startsWith('./'))
      .map(k => k.replace(/.svg$/, '').replace(/^.\//, ''));
  }


  static allAvatarColors() {
    return ['blue', 'red', 'green', 'magenta', 'cyan'];
  }

  static randomAvatar(): TerminalAvatar {
    const randomElement = (arr: any[]) => arr[_.random(0, arr.length-1)];

    return {
      avatarName: randomElement(this.allAvatarNames()),
      avatarColor: randomElement(this.allAvatarColors())
    };
  }
}
