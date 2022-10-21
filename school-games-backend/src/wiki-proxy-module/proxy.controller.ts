import { Controller, Get, HttpStatus, Logger, Req, Res } from '@nestjs/common';
import DomHandler from 'domhandler';
import { Request, Response } from 'express';
import { Parser } from 'htmlparser2';
import render from 'dom-serializer';

import * as http from 'http';
import * as https from 'https';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('p')
export class WikiProxyController {
  constructor(private _httpService: HttpService) {}

  @Get('*')
  handleProxyRequest(@Req() req: Request, @Res() res: Response) {
    const updatedUrl = req.url.replace(/^\/p/, '');
    console.log(updatedUrl);

    if (updatedUrl.startsWith('/wiki/')) {
      this.fetchWikiDefinitionPage(updatedUrl.substring(6), res);
    } else {
      https.get('https://he.wikipedia.org' + updatedUrl, (response) => {
        console.log(response.statusCode);
        res.statusCode = response.statusCode;

        Object.entries(response.headers).forEach(([header, value]) => {
          res.setHeader(header, value);
          console.log(`${header}: ${value}`);
        });

        console.log(response.headers['content-type']);
        if (response.headers['content-type'].startsWith('text/html')) {
          this.fixupHtmlContent(response, res);
        } else if (response.headers['content-type'].startsWith('text/css')) {
          this.fixupCssContent(response, res);
        } else {
          this.pipeResponse(response, res);
        }
      });
    }
  }

  private pipeResponse(response: http.IncomingMessage, res: Response) {
    response.on('readable', () => {
      const data = response.read();
      if (data) {
        res.write(data);
      }
    });

    response.on('end', () => res.end());

    response.on('error', (err: Error) => {
      Logger.error(err, 'Error reading from backend.');
      res.end();
    });
  }

  private async fetchWikiDefinitionPage(definition: string, target: Response) {
    const response = await firstValueFrom(
      this._httpService.get(
        `https://he.wikipedia.org/w/api.php?action=parse&format=json&prop=text&disableeditsection=false&useskin=cologneblue&page=${definition}`,
      ),
    );

    const defHtml = response.data?.parse?.text['*'];
    if (!defHtml) {
      throw new Error(`Cannot load definition for ${definition}`);
    }
    const fixedupHtml = this.fixupHtmlPageLinks(defHtml);

    const navMessage = JSON.stringify({
      type: 'wikiDefinitionLoaded',
      definition: decodeURI(definition),
    });

    const wikiFixup = `
        <html>
          <head>
            <script>
              window.parent.postMessage(${navMessage});
            </script>        

            <style>
              body { 
                direction: rtl;
              }
            </style>
          </head>
          <body>
            ${fixedupHtml}
          </body>
        </html>
    `;

    target.setHeader('content-type', 'text/html; charset=UTF-8');
    target.write(wikiFixup);
    target.end();
  }

  private fixupHtmlPageLinks(htmlToFixup: string): string {
    const domHandler = new DomHandler(null);
    const parser = new Parser(domHandler);
    parser.parseComplete(htmlToFixup);

    const transformElements = (elements: any[]) => {
      elements.forEach((element) => {
        console.log(element.type);
        if (element.type === 'tag') {
          switch (element.name) {
            case 'link':
              element.attribs['href'] = this.transformLink(
                element.attribs['href'],
              );
              break;
            case 'img':
              element.attribs['src'] = this.transformLink(
                element.attribs['src'],
              );
              break;

            case 'a':
              element.attribs['href'] = this.transformLink(
                element.attribs['href'],
              );
              break;
          }

          if (element.children) {
            transformElements(element.children);
          }
        } else if (element.type == 'script') {
          element.attribs['src'] = this.transformLink(element.attribs['src']);
        }
      });
    };

    console.log('PC');

    console.log(domHandler.dom);
    transformElements(domHandler.dom);
    return render(domHandler.dom);
  }

  private async fixupHtmlContent(
    response: http.IncomingMessage,
    res: Response,
  ): Promise<void> {
    const incomingHtml = await this.readIncomingMessage(response);

    console.log('GOT CONTENT: ' + incomingHtml);
    res.write(this.fixupHtmlPageLinks(incomingHtml));
    res.end();
  }

  private async fixupCssContent(
    response: http.IncomingMessage,
    res: Response,
  ): Promise<void> {
    let incomingCss = await this.readIncomingMessage(response);

    console.log('GOT CSS CONTENT: ' + incomingCss);

    incomingCss = incomingCss.replace(/url\(([^\)]+)\)/g, (substring, link) => {
      const ret = `url(${this.transformLink(link)})`;
      console.log(`replacing ${substring} with ${ret}`);
      return ret;
    });

    res.write(incomingCss);
    res.end();
  }

  private transformLink(link: string): string {
    if (link && link.startsWith('/')) {
      return `/p${link}`;
    } else {
      return link;
    }
  }

  private readIncomingMessage(response: http.IncomingMessage): Promise<string> {
    return new Promise((accept, reject) => {
      const chunks: any[] = [];

      response.on('readable', () => {
        const readData = response.read();
        if (readData) {
          chunks.push(readData);
        }
      });

      response.on('end', () => {
        accept(Buffer.concat(chunks).toString());
      });

      response.on('error', (e: Error) => {
        reject(e);
      });
    });
  }
}
