import React, { useRef } from "react";
import Draggable from "react-draggable";

export default function Router({ onStop, onDrag, id, x, y, start, size }: any) {
  const draggableRef = useRef<Draggable>(null);
  return (
    <>
      <Draggable
        ref={draggableRef}
        onStart={start}
        onStop={onStop}
        onDrag={onDrag}
        bounds="#board"
        defaultPosition={{ x: 0, y: 0 }}
        handle=".router"
      >
        <img
          id={id}
          draggable={false}
          className="absolute router"
          src="./images/pixil-7.png"
          alt="Placeable Router"
          style={{ transform: `translate(${x}px, ${y}px)`, width: size }}
        />
      </Draggable>
    </>
  );
}
