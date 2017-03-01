import { Directive, ElementRef, Input } from '@angular/core';

declare var hljs: any;

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
