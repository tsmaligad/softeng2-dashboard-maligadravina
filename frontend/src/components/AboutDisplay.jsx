import React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import useMediaQuery from "@mui/material/useMediaQuery";

const TILE_W = 330;   // rectangle width
const TILE_H = 200;   // rectangle height
const TILE_GAP = 8;   // spacing between items

function mapPosToSx(pos) {
  const a = { tl: "start", tc: "start", tr: "start", bl: "end", bc: "end", br: "end" }[pos] || "center";
  const j = {
    tl: "start", left: "start",
    tc: "center", center: "center",
    tr: "end", right: "end",
    bl: "start", bc: "center", br: "end"
  }[pos] || "center";
  return { alignSelf: a, justifySelf: j };
}

/** Re-usable public-facing About section (no header/Stickybar) */
export default function AboutDisplay({ heading = "About Us", body = "", images = [] }) {
  // Responsive column count
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const cols = isLg ? 3 : isMd ? 2 : 1;

  return (
    <div>
      <h1 className=" text-5xl font-kapakana italic text-left text-[#332601] mb-4">
        {heading}
      </h1>
      <hr className="mb-[90px] border-t border-[#8b7760]" />

      {!!body && (
        <div className=" mb-[90px] mt-6 text-[#332601] whitespace-pre-line text-center max-w-3xl mx-auto leading-relaxed">
          {body}
        </div>
      )}

      <div className="mt-8 mb-[130px]">
    

<ImageList
  sx={{ width: "100%", height: "auto", justifyItems: "center" }}
  cols={3}
  rowHeight={TILE_H}
  gap={TILE_GAP}
>
  {images.map((item) => (
    <ImageListItem
      key={item.id}
      sx={{
        width: TILE_W,
        height: TILE_H,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src={item.url}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </ImageListItem>
  ))}
</ImageList>

      </div>
    </div>
  );
}
