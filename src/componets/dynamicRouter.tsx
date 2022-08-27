import { useState } from "react";

interface Router {
  x: number;
  y: number;
  size: number;
}
export default function DynamicRouter({ x, y, size }: Router) {
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
