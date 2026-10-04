import Image from "next/image";

/**
 * The DevCraft mark — a needle threading a woven knot into code brackets
 * `{}`, tailoring and engineering literally interlaced. Replaces the earlier
 * woven-diamond placeholder. The source render is a tall (portrait) crop,
 * so /logo.png is padded out to a square canvas around it rather than
 * stretched — that's done once when the image is generated, not here.
 * Same file drives the favicon (app/icon.png, app/apple-icon.png).
 * No "use client": safe to render from Server Components.
 */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      loading="eager"
      className={className}
      style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.25))" }}
    />
  );
}
