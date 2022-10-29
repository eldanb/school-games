import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as _ from 'lodash';
import { TerminalAvatar } from 'school-games-common';

const AVATARS_RESOURCE_URL = '/frontend/assets/avatars.svg';

@Component({
  selector: 'app-avatar-view',
  templateUrl: './avatar-view.component.html',
  styleUrls: ['./avatar-view.component.scss']
})
export class AvatarViewComponent implements OnInit {

  constructor(private _sanitizer: DomSanitizer) { }

  @Input()
  avatar: TerminalAvatar | null;

  @Input()
  size: "small" | "medium" | "big";

  avatarContent: SafeHtml = "";

  ngOnInit(): void {
    AvatarViewComponent.getAvatarsSvg().then(() => {
      this.avatarContent = this._sanitizer.bypassSecurityTrustHtml(
        AvatarViewComponent.getSpriteXml(this.avatar?.avatarName || ""));
    })
  }

  get spriteRef(): string | null {
    return this.avatar && AvatarViewComponent.getSpriteRef(this.avatar.avatarName);
  }

  static getSpriteXml(avaterName: string): string {
    const avatarNode = this._cachedAvatarsSvg?.getElementById(`sprite-${avaterName}`) as Node;
    return new XMLSerializer().serializeToString(avatarNode) +
      '<use xlink:href="#sprite-'+ avaterName + '"/>';
  }

  static getSpriteRef(avaterName: string): string {
    return `${AVATARS_RESOURCE_URL}#sprite-${avaterName}`;
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

  static _cachedAvatarsSvgPromise: Promise<XMLDocument> | null;
  static _cachedAvatarsSvg: XMLDocument | null;

  static getAvatarsSvg(): Promise<XMLDocument> {
    if(!this._cachedAvatarsSvgPromise) {
      this._cachedAvatarsSvgPromise = fetch(AVATARS_RESOURCE_URL)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"));

      this._cachedAvatarsSvgPromise.then(res => this._cachedAvatarsSvg = res);
    }

    return this._cachedAvatarsSvgPromise;
  }
}
