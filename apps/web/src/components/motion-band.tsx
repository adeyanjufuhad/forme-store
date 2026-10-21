"use client";
import ScrollVelocity from "./reactbits/ScrollVelocity";
import { AsteriskIcon } from "@phosphor-icons/react";
import { useMotionPreference } from "./motion-provider";
export function MotionBand() {
  const { paused, reduced } = useMotionPreference();
  return (
    <div className="motion-band" aria-label="Every day. Your way.">
      <div aria-hidden>
        <ScrollVelocity
          texts={["EVERY DAY. YOUR WAY."]}
          velocity={38}
          fontSize="clamp(40px, 6.8vw, 98px)"
          fontWeight={650}
          gap={65}
          separator={
            <AsteriskIcon className="ticker-star" size="0.65em" weight="bold" />
          }
          pauseOnHover
          paused={paused || reduced}
          fadeEdges={false}
          draggable={false}
          numCopies={5}
        />
      </div>
    </div>
  );
}
