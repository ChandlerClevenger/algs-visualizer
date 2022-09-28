import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { DraggableData } from "react-draggable";
import Router from "../componets/DraggableRouter";
import Line from "../componets/Line";
import { RouterInt, LineInt, Edge, Node, Graph, LinePos } from "../types/bin";
const ROUTER_SIZE = 75;
const LINE_OFFSET = ROUTER_SIZE / 2;

const Home: NextPage = () => {
  const INITIAL_ROUTER: RouterInt = {
    onStop: drop,
    start: start,
    onDrag: drag,
    id: 0,
    x: 0,
    y: 0,
    prevNode: null,
    nextNode: null,
    size: ROUTER_SIZE,
    weight: -1,
  };

  useEffect(() => {
    console.log("Rendering");
  });

  // By useing ref here we can prevent an un-needed re-render on click
  let currentDraggedRef = useRef({ x: 0, y: 0 });
  const [routers, setRouters] = useState<RouterInt[]>([INITIAL_ROUTER]);
  const [lines, setLines] = useState<LineInt[]>([]);
  const [linePositions, setLinePositions] = useState<LinePos[]>([]);
  const [clickedRouterId, setClickedRouterId] = useState<number>(-1);
  const [rootRouterId, setRootRouterId] = useState<number>(0);

  function drag(e: MouseEvent, info: DraggableData): void {
    const DRAGGED_ID = Number(info.node.id);
    // Update line pos on drag
    lines.map((line) => {
      if (line.firstNode.id == DRAGGED_ID) {
        setLinePositions((oldLinePos) =>
          oldLinePos.map((ol) => {
            if (ol.id == line.id) {
              return {
                ...ol,
                x1: info.x + LINE_OFFSET,
                y1: info.y + LINE_OFFSET,
              };
            } else {
              return ol;
            }
          })
        );
      } else if (line.secondNode.id == DRAGGED_ID) {
        setLinePositions((oldLinePos) =>
          oldLinePos.map((ol) => {
            if (ol.id == line.id) {
              return {
                ...ol,
                x2: info.x + LINE_OFFSET,
                y2: info.y + LINE_OFFSET,
              };
            } else {
              return ol;
            }
          })
        );
      }
    });
  }

  // Set draggables current position to check if click or drag
  // This is checked in the drop function
  function start(e: MouseEvent, info: DraggableData): void {
    currentDraggedRef.current = { x: info.x, y: info.y };
  }

  function drop(e: MouseEvent, info: DraggableData): void {
    const { x, y } = { ...info };
    // Must move at least 100 px out of start area
    if (x < 100 && y < 100) return;
    // Detect click
    if (currentDraggedRef.current.x == x && currentDraggedRef.current.y == y) {
      handleRouterClick(e, info);
      return;
    }

    const DRAGGED_ID = Number(info.node.id);
    // Update x and y if router moved
    setRouters((oldRouters) =>
      oldRouters.map((r) => {
        if (Number(r.id) == DRAGGED_ID) {
          // update position of old
          return {
            ...r,
            x: info.x,
            y: info.y,
          };
        } else {
          return r;
        }
      })
    );

    // If newest router is dragged out, add new router
    // Add router as Node
    if (DRAGGED_ID == routers.length - 1) {
      const newRouter = {
        id: routers.length,
        x: 0,
        y: 0,
        size: ROUTER_SIZE,
        weight: -1,
        prevNode: null,
        nextNode: null,
        onStop: drop,
        start: start,
        onDrag: drag,
      };
      setRouters((routers) => [...routers, newRouter]);
    }
  }

  function lineClick(e: MouseEvent): void {}

  function getWeight(): number {
    let weight = 0;
    try {
      const prompted = prompt("Enter a new weight: ");
      if (!prompted) throw TypeError("Nothing was entered");
      weight = parseInt(prompted);
      if (isNaN(weight)) throw TypeError("NaN");
      if (weight < 0) throw TypeError("Weight can not be negative");
    } catch (e) {
      console.log(e);
      return -1;
    }
    return weight;
  }

  function handleRouterClick(e: MouseEvent, info: DraggableData): void {
    const CLICKED_ROUTER_ID = Number(info.node.id);
    switch (e.button) {
      case 0:
        // Left Click
        if (clickedRouterId != -1) {
          const firstRouter = routers.find((router) => {
            return router.id == CLICKED_ROUTER_ID;
          });
          const secondRouter = routers.find((router) => {
            return router.id == clickedRouterId;
          });
          if (!firstRouter || !secondRouter) return;

          const [smaller, larger] = [firstRouter, secondRouter].sort((a, b) =>
            a.id > b.id ? 1 : -1
          );

          if (!(smaller && larger)) return;
          // Check for dupe connections
          for (const line of lines) {
            if (
              line.firstNode.id == smaller.id &&
              line.secondNode.id == larger.id
            ) {
              return;
            }
          }
          setLinePositions((oldLinesPos) => [
            ...oldLinesPos,
            {
              id: lines.length,
              x1: smaller.x + LINE_OFFSET,
              y1: smaller.y + LINE_OFFSET,
              x2: larger.x + LINE_OFFSET,
              y2: larger.y + LINE_OFFSET,
              weight: 0,
            },
          ]);
          setLines((oldLines) => [
            ...oldLines,
            {
              id: lines.length,
              firstNode: smaller,
              secondNode: larger,
              weight: 0,
            },
          ]);
          setClickedRouterId(-1);
        } else {
          setClickedRouterId(CLICKED_ROUTER_ID);
        }
        break;
      case 2:
        // Right Click
        setRootRouterId(CLICKED_ROUTER_ID);
        break;
      default:
        console.log("Inproper keypress");
        break;
    }
  }

  // /**
  //  *
  //  * @param edges the connections
  //  * @param nodes unique set of numbers as ids
  //  * @param startingNode root node id
  //  * @returns list finalconnections
  //  */
  // function performDijkstra(
  //   edges: LineInt[],
  //   nodes: number[],
  //   startingNode: number
  // ) {
  //   const visitedNodes: number[] | undefined = [];
  //   let currentNode: number | undefined = startingNode;
  //   let finalConnections = initializeFinalConnections(
  //     edges,
  //     nodes,
  //     currentNode
  //   );
  //   visitedNodes.push(currentNode);

  //   while (visitedNodes.length != nodes.length) {
  //     currentNode = pickBestNode(finalConnections, nodes, visitedNodes);
  //     if (!currentNode) continue;
  //     visitedNodes.push(currentNode);

  //     finalConnections = updateConnections(
  //       finalConnections,
  //       edges,
  //       currentNode
  //     );
  //   }
  //   const finalConnectionsList = [];
  //   for (const [key, value] of Object.entries(finalConnections)) {
  //     finalConnectionsList.push(value);
  //   }
  //   return finalConnectionsList;
  // }

  // function updateConnections(
  //   finalConnections: any,
  //   edges: Edge[],
  //   currentNode: number
  // ) {
  //   for (const edge of edges) {
  //     if (edge.firstNode == currentNode || edge.secondNode == currentNode) {
  //       const notCurrent =
  //         edge.firstNode == currentNode ? edge.secondNode : edge.firstNode;
  //       const currNode =
  //         edge.firstNode == notCurrent ? edge.secondNode : edge.firstNode;
  //       if (
  //         finalConnections[currNode].weight + edge.weight <
  //         finalConnections[notCurrent].weight
  //       ) {
  //         finalConnections[notCurrent] = {
  //           weight: finalConnections[currNode].weight + edge.weight,
  //           prevNode: currNode,
  //         };
  //       }
  //     }
  //   }
  //   return finalConnections;
  // }

  // function initializeFinalConnections(
  //   edges: LineInt[],
  //   nodes: number[],
  //   currentNode: number
  // ) {
  //   const initCons: any = {};
  //   initCons[currentNode] = { weight: 0, prevNode: currentNode };

  //   for (const edge of edges) {
  //     if (edge.firstNode == currentNode || edge.secondNode == currentNode) {
  //       const notCurrent =
  //         edge.firstNode == currentNode ? edge.secondNode : edge.firstNode;
  //       const prevNode =
  //         edge.firstNode == notCurrent ? edge.secondNode : edge.firstNode;
  //       initCons[notCurrent] = { weight: edge.weight, prevNode: prevNode };
  //     }
  //   }

  //   for (const node of nodes) {
  //     if (!initCons[node]) {
  //       initCons[node] = { weight: Infinity, prevNode: null };
  //     }
  //   }
  //   return initCons;
  // }

  // function pickBestNode(
  //   finalConnections: any,
  //   nodes: number[],
  //   visitedNodes: number[]
  // ): number | undefined {
  //   const nodesToVisit = nodes.filter((node) => !visitedNodes.includes(node));
  //   let minNode = nodesToVisit[0];
  //   for (const node of nodesToVisit) {
  //     if (!minNode) continue;
  //     if (finalConnections[node].weight < finalConnections[minNode].weight) {
  //       minNode = node;
  //     }
  //   }
  //   return minNode;
  // }

  return (
    <>
      <Head>
        <title>Ball State - CS Team</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen w-screen overflow-hidden bg-slate-400">
        <div className="absolute right-[15%]">
          Current selected router is:{" "}
          {clickedRouterId == -1 ? "None" : clickedRouterId}
          <br />
          Current root: {rootRouterId}
        </div>
        <div id="board" className="w-screen opacity-1">
          <svg id="lines" className="absolute w-screen h-screen">
            {linePositions.map((line, index) => (
              <Line key={index} clicked={lineClick} {...line} />
            ))}
          </svg>
          {routers.map((router, index) => (
            <Router
              size={ROUTER_SIZE}
              key={index}
              id={router.id}
              x={router.x}
              y={router.y}
              prevNode={router.prevNode}
              nextNode={router.nextNode}
              start={start}
              onStop={drop}
              onDrag={drag}
              weight={router.weight}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
