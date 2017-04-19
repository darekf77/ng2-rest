import { Component, OnInit } from '@angular/core';


type Lang = 'html' | 'typescript' | 'scss' | 'json';

export interface IPreview {
    name: string;
    lang: Lang;
    content: string;
}

export class Preview implements IPreview {
    constructor(public name: string, public lang: Lang, public content: string) {
        this.content = this.clear(content);
    }

    clear(requireString: string): string {
        let tmp = requireString.split('\n');
        if (tmp && Array.isArray(tmp)) {
            tmp.forEach((f, k) => {
                let match = f.match(/###.+###/g);
                if (match && Array.isArray(match)) {
                    match.forEach(i => {
                        let whitespaces = tmp[k].match(/\ +/g);
                        let begin = (whitespaces && Array.isArray(whitespaces) && whitespaces.length > 0 && whitespaces[0].length > 1) ? whitespaces[0] : '';
                        tmp[k] = begin + i.replace(/###/g, '').trim()
                    })
                }

            })
            tmp = tmp.filter(s => (s.search('###') === -1))

            return tmp.join('\n');
        }
        return requireString;

    }

}



export let PreviewTemplate = require('!raw-loader!./preview.html');



@Component({
    selector: 'preview-base',
    template: '<div></div>'
})
export class PreviewBase {

    public previews: Preview[] = [];

    constructor() {

    }



}

