import { useState } from "react";

interface Router {
  id: number;
  x: number;
  y: number;
}
export default function DynamicRouter({ x, y, id, size }) {
  return (
    <>
      <img
        draggable={false}
        className={``}
        style={{
          width: size,
          height: size,
          position: "absolute",
          top: y,
          left: x,
          transform: `translate(-${size / 2}px, -${size / 2}px)`,
        }}
        src="./images/pixil-7.png"
        alt="Placeable Router"
      />
    </>
  );
}
