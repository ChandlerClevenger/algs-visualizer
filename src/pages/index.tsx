import { copyFileSync } from "fs";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { DraggableData } from "react-draggable";
import Router from "../componets/router";

const ROUTER_SIZE = 75;
interface RouterInt {
  onStop: any;
  start: any;
  id: number;
  x: number;
  y: number;
}

const Home: NextPage = () => {
  const defaultRouter: RouterInt = {
    onStop: drop,
    start: start,
    id: 0,
    x: 0,
    y: 0,
  };
  const [routers, setRouters] = useState<RouterInt[]>([defaultRouter]);
  const [currentPos, setCurrentPos] = useState({ top: 0, left: 0 });
  const [lines, setLines] = useState<React.SVGProps<SVGLineElement>[]>([]);
  const [clickedRouter, setClickedRouter] = useState<any>();

  function start(e: any) {
    const { top, left } = e.target.getBoundingClientRect();
    setCurrentPos({ top, left });
  }

  function drop(e: any, info: DraggableData) {
    const { top, left } = e.target.getBoundingClientRect();
    // Must move at least 100 px out
    if (info.x < 100 && info.y < 100) return;

    // Detect click
    if (currentPos.left == left && currentPos.top == top) {
      handleClick(e, info);
      return;
    }

    const DRAGGED_ID = Number(info.node.id);
    for (const router of routers) {
      if (router.id == DRAGGED_ID) {
        // update position of old
        router.x = info.x;
        router.y = info.y;
      }
    }

    if (DRAGGED_ID == routers.length - 1) {
      setRouters((oldRouters) => [
        ...oldRouters,
        { start: start, onStop: drop, id: routers.length, x: 0, y: 0 },
      ]);
    }
    console.log(routers);
  }

  function drawLine(el1: RouterInt, el2: RouterInt) {
    if (!clickedRouter) return;
    const diff = ROUTER_SIZE / 2;
    const x1 = el1.x + diff;
    const x2 = el2.x + diff;
    const y1 = clickedRouter.y + diff;
    const y2 = el2.y + diff;
    setLines((oldLines) => [...oldLines, { x1: x1, x2: x2, y1: y1, y2: y2 }]);
  }

  function handleClick(e: any, info: DraggableData) {
    console.log("clicked");
    if (clickedRouter) {
      drawLine(
        { ...clickedRouter },
        { start: start, onStop: drop, id: e.target.id, x: info.x, y: info.y }
      );
      setClickedRouter(null);
      console.log("Resetting clicked");
      return;
    }
    console.log("Setting first clicked");
    setClickedRouter({
      start: start,
      onstop: drop,
      id: e.target.id,
      x: info.x,
      y: info.y,
    });
    console.log(clickedRouter);
  }

  return (
    <>
      <Head>
        <title>Ball State - CS Team</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen w-screen overflow-hidden bg-slate-400">
        <div id="board" className="w-screen opacity-1">
          <svg
            id="lines"
            className="absolute w-screen h-screen pointer-events-none"
          >
            {lines.map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                strokeWidth={1}
                stroke={"black"}
              />
            ))}
          </svg>
          {routers.map((router, index) => (
            <Router
              size={ROUTER_SIZE}
              key={index}
              id={router.id}
              x={router.x}
              y={router.y}
              start={start}
              onStop={drop}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
