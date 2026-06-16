"use client";

import { type ReactNode, useState } from "react";

// Circular avatar that shows an image, falling back to a JDS icon if the image
// is missing (so the screen never breaks before the PNGs are added). Caller
// supplies size/shape/bg via className; the image fills via object-cover.
export function Avatar({
  src,
  alt,
  fallback,
  className = "",
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  return (
    <span className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {ok ? (
        // Plain <img> (not next/image) — static export + simple decorative use.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        fallback
      )}
    </span>
  );
}
