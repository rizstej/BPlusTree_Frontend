import { Component, HostListener, ContentChildren, Input, ViewChild, ElementRef, QueryList } from '@angular/core';
import { zip } from 'rxjs/observable/zip';
import { from } from 'rxjs/observable/from';
import { merge } from 'rxjs/observable/merge';
import 'rxjs/add/operator/switchMap';
import { Rect } from './rect';

import { LineAnchorDirective } from './line-anchor.directive';

type HorizontalAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';
type Position = [VerticalAlignment, HorizontalAlignment];

export interface Line {
  from: string;
  to: string;
  position?: {
    from: Position;
    to: Position
  }
}

interface SvgLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'draw-lines',
  templateUrl: './draw-lines.component.html',
  styleUrls: ['./draw-lines.component.css']
})
export class DrawLinesComponent {
  @Input() lines: Line[] = [];
  @ViewChild('svg', {static: false}) svg: ElementRef;

  @ContentChildren(LineAnchorDirective, {descendants: true}) anchors:
  QueryList<LineAnchorDirective>;

  svgLines: SvgLine[] = [];

  ngAfterContentInit(): void {
    this.anchors.changes.switchMap(() => merge(
      //...this.anchors.map(e => e.resize)
    )).subscribe(() => this.repaint());

    this.anchors.notifyOnChanges();
  }

  ngOnChanges() {
    setTimeout(() => this.repaint());
  }

  repaint(): void {
    if (!this.svg || !this.lines) {
      return;
    }

    this.svgLines = this.lines.map(line => this.lineToSvgLine(line));
  }

  lineToSvgLine(line: Line): SvgLine {
    const getAnchor = name => this.anchors.find(dir => dir.name === name);
    const container = Rect.fromElement(this.svg);
    
    const rectFrom = getAnchor(line.from).rect.relativeTo(container);
    const rectTo = getAnchor(line.to).rect.relativeTo(container);
    
    const { from, to } = line.position || { from: ['middle', 'center'], to: ['middle', 'center'] };

    const pointFrom = rectFrom.getPoint("bottom","center");
    const pointTo = rectTo.getPoint("top","center");

    return {
      x1: pointFrom.x,
      y1: pointFrom.y,
      x2: pointTo.x,
      y2: pointTo.y
    };
  }
}