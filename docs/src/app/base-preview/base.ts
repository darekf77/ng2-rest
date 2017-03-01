import { Component, OnInit } from '@angular/core';


type Lang = 'html' | 'typescript' | 'scss' | 'json' ;

export interface IPreview {
    name: string;
    lang: Lang;
    content: string;
}

export class Preview implements IPreview {
    constructor(public name: string, public lang: Lang, public content: string) {

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

