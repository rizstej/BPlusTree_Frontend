
import { ElementRef } from '@angular/core';

export class Point {
  x: number;
  y: number;
}

export class Rect {
  constructor(
    public top: number,
    public left: number,
    public width: number,
    public height: number,
  ) { }

  static fromElement(element: ElementRef): Rect {
    const rect = element.nativeElement.getBoundingClientRect();

    return new Rect(rect.top, rect.left, rect.width, rect.height);
  }

  get right() {
    return this.left + this.width;
  }

  get bottom() {
    return this.top + this.height;
  }

  get centerX() {
    return this.left + this.width / 2;
  }

  get centerY() {
    return this.top + this.height / 2;
  }

  getPoint(vertical: 'top' | 'center' | 'bottom', horizontal: 'left' | 'center' | 'right'): Point {
    return {
      x: horizontal === 'left' ? this.left : horizontal === 'right' ? this.right : this.centerX,
      y: vertical === 'top' ? this.top : vertical === 'bottom' ? this.bottom : this.centerY,
    };
  }

  relativeTo(rect: Rect) {
    return new Rect(
      this.top - rect.top,
      this.left - rect.left,
      this.width,
      this.height
    );
  }
}