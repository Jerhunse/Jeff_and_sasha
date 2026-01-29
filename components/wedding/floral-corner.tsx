export function FloralCorner({ position }: { position: "tl" | "br" }) {
  const src = position === "tl" ? "/florals/corner-tl.svg" : "/florals/corner-br.svg";
  return (
    <img
      className={`floral ${position}`}
      src={src}
      alt=""
      aria-hidden
    />
  );
}

export function FloralCorners() {
  return (
    <>
      <FloralCorner position="tl" />
      <FloralCorner position="br" />
    </>
  );
}
