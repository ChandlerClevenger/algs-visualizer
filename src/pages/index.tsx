import type { NextPage } from "next";
import Head from "next/head";
import Script from "next/script";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { DraggableData } from "react-draggable";
import Router from "../componets/DraggableRouter";
import Line from "../componets/Line";
import { RouterInt, LineInt } from "../types/bin";
const ROUTER_SIZE = 75;
const LINE_OFFSET = ROUTER_SIZE / 2;

const Home: NextPage = () => {
  const defaultRouter: RouterInt = {
    onStop: drop,
    start: start,
    onDrag: drag,
    id: 0,
    x: 0,
    y: 0,
    size: ROUTER_SIZE,
    weight: -1,
  };
  const [routers, setRouters] = useState<RouterInt[]>([defaultRouter]);
  const [currentPos, setCurrentPos] = useState({ top: 0, left: 0 });
  const [lines, setLines] = useState<LineInt[]>([]);
  const [clickedRouterId, setClickedRouterId] = useState<number>(-1);
  const [lineClicked, setLineClicked] = useState<number>(-1);
  const [runDijk, setRunDijk] = useState<boolean>(false);

  function drag(e: any, info: DraggableData): void {
    const DRAGGED_ID = Number(info.node.id);
    // Update lines
    lines.map((line) => {
      if (
        [Number(line.firstNode), Number(line.secondNode)].includes(DRAGGED_ID)
      ) {
        if (DRAGGED_ID == line.firstNode) {
          line.x1 = info.x + LINE_OFFSET;
          line.y1 = info.y + LINE_OFFSET;
        } else {
          line.x2 = info.x + LINE_OFFSET;
          line.y2 = info.y + LINE_OFFSET;
        }
      }
    });
    setLines((lines) => [...lines]);
  }

  function start(e: BaseSyntheticEvent): void {
    const { top, left } = e.target.getBoundingClientRect();
    setCurrentPos({ top, left });
  }

  function drop(e: BaseSyntheticEvent, info: DraggableData): void {
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
        {
          start: start,
          onStop: drop,
          onDrag: drag,
          id: routers.length,
          x: 0,
          y: 0,
          size: ROUTER_SIZE,
          weight: -1,
        },
      ]);
    }
  }

  function lineClick(e: any) {
    setLineClicked(parseInt(e.target.id.replace(/^\D+/g, "")));
  }

  useEffect(() => {
    if (lineClicked == -1) return;
    setLineClicked(-1);
    const WEIGHT = getWeight();
    if (WEIGHT == -1) return;
    lines.map((line) => {
      if (line.id == lineClicked) {
        line.weight = WEIGHT;
      }
    });
    setRunDijk(true);
  }, [lineClicked]);

  useEffect(() => {
    if (!runDijk) return;
    const results = performDijkstra(
      lines,
      [
        ...routers.map((r) => {
          return r.id;
        }),
      ],
      routers[0].id
    );
    console.log(Object.keys(results));
    for (const key in Object.keys(results)) {
      const router = routers.find((r) => {
        return r.id == Number(key);
      });
      router.weight = results[router.id].weight;
    }
    setRunDijk(false);
  }, [runDijk]);

  function getWeight(): number {
    let weight = 0;
    try {
      const prompted = prompt("Enter a new weight: ");
      if (!prompted) throw TypeError("Nothing was entered");
      weight = parseInt(prompted);
      if (isNaN(weight)) throw TypeError("NaN");
    } catch (e) {
      console.log(e);
      return -1;
    }
    return weight;
  }

  function handleClick(e: BaseSyntheticEvent, info: DraggableData): void {
    const nodeId = Number(info.node.id);
    if (clickedRouterId == -1 || clickedRouterId == nodeId) {
      setClickedRouterId(nodeId);
      return;
    }

    const firstRouter = routers.find((router) => {
      return router.id == nodeId;
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
      if (line.firstNode == smaller.id && line.secondNode == larger.id) {
        return;
      }
    }

    setLines((oldLines) => [
      ...oldLines,
      {
        clicked: lineClick,
        firstNode: smaller.id,
        secondNode: larger.id,
        id: lines.length,
        x1: smaller.x + LINE_OFFSET,
        x2: larger.x + LINE_OFFSET,
        y1: smaller.y + LINE_OFFSET,
        y2: larger.y + LINE_OFFSET,
        weight: 0,
      },
    ]);
    setRunDijk(true);
    setClickedRouterId(-1);
  }

  function performDijkstra(edges, nodes, startingNode) {
    console.log("Edges: ", edges);
    console.log("Nodes: ", nodes);
    console.log("startNode: ", startingNode);

    let visitedNodes = [];
    let currentNode = startingNode;
    let finalConnections = initializeFinalConnections(
      edges,
      nodes,
      currentNode
    );
    visitedNodes.push(currentNode);

    while (visitedNodes.length != nodes.length) {
      currentNode = pickBestNode(finalConnections, nodes, visitedNodes);
      visitedNodes.push(currentNode);

      finalConnections = updateConnections(
        finalConnections,
        edges,
        currentNode
      );
    }
    return finalConnections;
  }

  function updateConnections(finalConnections, edges, currentNode) {
    for (let edge of edges) {
      if (edge.firstNode == currentNode || edge.secondNode == currentNode) {
        let notCurrent =
          edge.firstNode == currentNode ? edge.secondNode : edge.firstNode;
        let currNode =
          edge.firstNode == notCurrent ? edge.secondNode : edge.firstNode;
        if (
          finalConnections[currNode].weight + edge.weight <
          finalConnections[notCurrent].weight
        ) {
          finalConnections[notCurrent] = {
            weight: finalConnections[currNode].weight + edge.weight,
            prevNode: currNode,
          };
        }
      }
    }
    return finalConnections;
  }

  function initializeFinalConnections(edges, nodes, currentNode) {
    let initCons = {};
    initCons[currentNode] = { weight: 0, prevNode: currentNode };

    for (let edge of edges) {
      if (edge.firstNode == currentNode || edge.secondNode == currentNode) {
        let notCurrent =
          edge.firstNode == currentNode ? edge.secondNode : edge.firstNode;
        let prevNode =
          edge.firstNode == notCurrent ? edge.secondNode : edge.firstNode;
        initCons[notCurrent] = { weight: edge.weight, prevNode: prevNode };
      }
    }

    for (let node of nodes) {
      if (!initCons[node]) {
        initCons[node] = { weight: Infinity, prevNode: null };
      }
    }
    return initCons;
  }

  function pickBestNode(finalConnections, nodes, visitedNodes) {
    let nodesToVisit = nodes.filter((node) => !visitedNodes.includes(node));
    let minNode = nodesToVisit[0];
    for (let node of nodesToVisit) {
      if (finalConnections[node].weight < finalConnections[minNode].weight) {
        minNode = node;
      }
    }
    return minNode;
  }

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
        </div>
        <div id="board" className="w-screen opacity-1">
          <svg id="lines" className="absolute w-screen h-screen">
            {lines.map((line, index) => (
              <Line key={index} {...line} />
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
