import { Directive, Input, Output, ElementRef, EventEmitter, NgZone } from '@angular/core';

import { Rect } from './rect';
//import { fromResizeObserver, ResizeEvent } from '../from-resize-observer';

@Directive({
  selector: '[lineAnchor]'
})
export class LineAnchorDirective {
  @Input('lineAnchor') name: string;
  //@Output() resize = new EventEmitter<ResizeEvent>();

  constructor(private element: ElementRef, private zone: NgZone) { }

  ngOnInit(): void {
    //fromResizeObserver(this.element.nativeElement).subscribe(event => {
      //this.zone.run(() => this.resize.emit(event));
    //});
  }

  get rect() {
    return Rect.fromElement(this.element);
  }
}