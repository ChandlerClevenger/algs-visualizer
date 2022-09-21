export interface RouterInt {
  onStop: any;
  start: any;
  onDrag: any;
  id: number;
  x: number;
  y: number;
  size: number;
  weight: number;
}

export interface LineInt {
  clicked: any;
  firstNode: number;
  secondNode: number;
  id: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  weight: number;
}
