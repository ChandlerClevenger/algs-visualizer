import { LineInt } from "../types/bin";
export default function Line({ id, x1, y1, x2, y2, weight, clicked }: LineInt) {
  return (
    <>
      <line
        onClick={clicked}
        id={`line-${id}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth={3}
        stroke={"yellow"}
      />
      <text
        id={`line-weight-${id}`}
        onClick={clicked}
        strokeWidth={1}
        y={(y1 + y2 + 30) / 2}
        x={(x1 + x2) / 2}
      >
        {weight}
      </text>
    </>
  );
}
