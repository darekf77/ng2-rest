import { Directive, ElementRef, Input } from '@angular/core';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import scss from 'highlight.js/lib/languages/scss';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('scss', scss);
import 'highlight.js/styles/github.css';

@Directive({
  selector: 'code[highlight]'
})
export class HighlightCodeDirective {
  constructor(private elementRef: ElementRef) {
  }

  ngAfterViewInit() {

    if (this.elementRef.nativeElement) {
      hljs.highlightBlock(this.elementRef.nativeElement);
    }
  }
}
