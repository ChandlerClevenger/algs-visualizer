import React, { useRef } from "react";
import Draggable from "react-draggable";
import { RouterInt } from "../types/bin";

export default function Router({
  onStop,
  onDrag,
  id,
  x,
  y,
  start,
  size,
  weight,
}: RouterInt) {
  const draggableRef = useRef<Draggable>(null);
  return (
    <Draggable
      ref={draggableRef}
      onStart={start}
      onStop={onStop}
      onDrag={onDrag}
      bounds="#board"
      defaultPosition={{ x: 0, y: 0 }}
      handle=".router"
    >
      <div
        className="absolute router"
        style={{ transform: `translate(${x}px, ${y}px)`, width: size }}
        id={id.toString()}
      >
        <img
          draggable={false}
          src="./images/pixil-7.png"
          alt="Placeable Router"
        />
        <p className="text-sm text-center">Id: {id}</p>
        <p className="text-sm text-center">
          Weight: {weight == -1 ? "INF" : weight}
        </p>
      </div>
    </Draggable>
  );
}
