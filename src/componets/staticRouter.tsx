import React from "react";
import Draggable from "react-draggable";

export default function StaticRouter({ onStop, position, size }) {
  return (
    <>
      <Draggable
        onStop={onStop}
        bounds="#board"
        position={position}
        defaultPosition={{ x: 0, y: 0 }}
      >
        <img
          draggable={false}
          className="static-router mt-4"
          src="./images/pixil-7.png"
          alt="Placeable Router"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
      </Draggable>
    </>
  );
}
