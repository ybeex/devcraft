"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, type Variants } from "framer-motion";
import { KwalbaFrame } from "@/components/hausa";
import { ButtonLink } from "@/components/ui/Button";
import type { Testimonial } from "./testimonial.types";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

const ORBIT_WIDTH = 360;
const ORBIT_HEIGHT = 230;
const CENTER_X = 112;
const CENTER_Y = ORBIT_HEIGHT / 2;
const RADIUS = 110;
const ANGLE_STEP = 0.6;
const ARC_LIMIT = 1.05;
const CYCLE_DELAY = 4_200;

const ERA_LABELS: Record<Testimonial["era"], string> = {
  team: "HNG Internship",
  client: "Client",
  colleague: "Colleague",
};

const ERA_COLORS: Record<Testimonial["era"], string> = {
  team: "var(--brand)",
  client: "var(--indigo)",
  colleague: "var(--ghost)",
};

const quoteVariants: Variants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.2, ease: "easeIn" } },
};

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

function pointOnOrbit(angle: number) {
  return {
    x: CENTER_X - RADIUS + RADIUS * Math.cos(angle),
    y: CENTER_Y + RADIUS * Math.sin(angle),
  };
}

function RelationshipBadge({ era, className }: { era: Testimonial["era"]; className: string }) {
  const color = ERA_COLORS[era];
  return (
    <span
      className={`border font-mono font-semibold uppercase ${className}`}
      style={{
        borderColor: `color-mix(in srgb, ${color} 45%, var(--glass-border))`,
        color,
        background: `color-mix(in srgb, ${color} 8%, var(--glass-bg-strong))`,
      }}
    >
      {ERA_LABELS[era]}
    </span>
  );
}

function OrbitAvatar({ testimonial, color }: { testimonial: Testimonial; color: string }) {
  return (
    <div data-orbit-avatar className="relative shrink-0" style={{ width: 52, height: 52, flexBasis: 52 }}>
      <div data-orbit-avatar-scale className="absolute left-0 top-0 origin-top-left">
        <KwalbaFrame size={52} color={color}>
          {testimonial.photoUrl ? (
            <img
              src={testimonial.photoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span data-orbit-initials className="font-display font-bold" style={{ color, fontSize: 11 }} aria-hidden="true">
              {testimonial.initials}
            </span>
          )}
        </KwalbaFrame>
      </div>
    </div>
  );
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const initialIndex = Math.max(0, testimonials.length - 1);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [orbitScale, setOrbitScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const orbitTarget = useMotionValue(initialIndex);
  const orbitPosition = useSpring(orbitTarget, {
    stiffness: 55,
    damping: 2 * Math.sqrt(55),
    restDelta: 0.0005,
    restSpeed: 0.005,
  });
  const carouselRef = useRef<HTMLElement>(null);
  const orbitViewportRef = useRef<HTMLDivElement>(null);
  const reviewerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastAnnouncedIndex = useRef(initialIndex);
  const isInView = useInView(carouselRef, { amount: 0.15 });
  const count = testimonials.length;
  const selected = testimonials[activeIndex];

  const updateOrbit = useCallback((position: number) => {
    if (count === 0) return;
    reviewerRefs.current.forEach((button, index) => {
      if (!button) return;

      const offset = ((index - position + count / 2) % count + count) % count - count / 2;
      const distance = Math.abs(offset);
      const prominence = 1 - smoothstep(Math.min(distance, 1));
      const angle = offset * ANGLE_STEP;
      const size = 34 + (52 - 34) * prominence;
      const point = pointOnOrbit(angle);
      const opacity = 1 - smoothstep(Math.max(0, Math.min(1, (distance - 1) / 0.4)));
      const gap = 14 + (20 - 14) * prominence;

      const hitTargetHeight = Math.max(size, 44 / orbitScale);
      button.style.transform = `translate3d(${point.x - size / 2}px, ${point.y - hitTargetHeight / 2}px, 0)`;
      button.style.opacity = opacity.toFixed(3);
      button.style.pointerEvents = opacity > 0.3 ? "auto" : "none";
      button.style.zIndex = String(Math.round(10 - distance * 3));
      button.style.gap = `${gap}px`;
      button.style.minWidth = `${44 / orbitScale}px`;
      button.style.minHeight = `${44 / orbitScale}px`;

      const avatar = button.querySelector<HTMLElement>("[data-orbit-avatar]");
      const avatarScale = button.querySelector<HTMLElement>("[data-orbit-avatar-scale]");
      const initials = button.querySelector<HTMLElement>("[data-orbit-initials]");
      const name = button.querySelector<HTMLElement>("[data-orbit-name]");
      const role = button.querySelector<HTMLElement>("[data-orbit-role]");
      const label = button.querySelector<HTMLElement>("[data-orbit-label]");

      if (avatar) {
        avatar.style.width = `${size}px`;
        avatar.style.height = `${size}px`;
        avatar.style.flexBasis = `${size}px`;
      }
      if (avatarScale) avatarScale.style.transform = `scale(${size / 52})`;
      if (initials) initials.style.fontSize = `${11 + 4 * prominence}px`;
      if (name) {
        name.style.fontSize = `${12.5 + 5 * prominence}px`;
        name.style.fontWeight = prominence > 0.5 ? "600" : "500";
      }
      if (role) role.style.fontSize = `${10.5 + 2.5 * prominence}px`;
      if (label) label.style.marginTop = `${3 + 2 * prominence}px`;
    });
  }, [count, orbitScale]);

  useMotionValueEvent(orbitPosition, "change", (position) => {
    if (count === 0) return;
    updateOrbit(position);
    const nextActiveIndex = wrapIndex(Math.round(position), count);
    if (lastAnnouncedIndex.current !== nextActiveIndex) {
      lastAnnouncedIndex.current = nextActiveIndex;
      setActiveIndex(nextActiveIndex);
    }
  });

  useLayoutEffect(() => {
    updateOrbit(orbitPosition.get());
  }, [orbitPosition, updateOrbit]);

  useEffect(() => {
    const viewport = orbitViewportRef.current;
    const container = viewport?.parentElement;
    if (!viewport || !container) return;

    const measure = () => {
      const availableWidth = container.getBoundingClientRect().width;
      if (availableWidth <= 0) return;
      setOrbitScale(Math.min(1, availableWidth / ORBIT_WIDTH));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (
      count < 2 ||
      !isInView ||
      !documentVisible ||
      isHovered ||
      focusPaused ||
      reducedMotion !== false
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      orbitTarget.set(orbitTarget.get() + 1);
    }, CYCLE_DELAY);
    return () => window.clearTimeout(timer);
  }, [activeIndex, count, documentVisible, focusPaused, isHovered, isInView, orbitTarget, reducedMotion]);

  if (!selected) return null;

  function selectReviewer(index: number) {
    if (count < 2) return;
    const requestedIndex = wrapIndex(Math.round(orbitTarget.get()), count);
    let delta = wrapIndex(index - requestedIndex, count);
    if (delta > count / 2) delta -= count;
    const nextTarget = orbitTarget.get() + delta;

    if (reducedMotion) {
      orbitTarget.jump(nextTarget);
      orbitPosition.jump(nextTarget);
      updateOrbit(nextTarget);
      setActiveIndex(index);
    } else {
      orbitTarget.set(nextTarget);
    }
  }

  function handleReviewerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = wrapIndex(index + 1, count);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = wrapIndex(index - 1, count);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = count - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    selectReviewer(nextIndex);
    reviewerRefs.current[nextIndex]?.focus();
  }

  return (
    <section
      ref={carouselRef}
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="relative isolate overflow-hidden"
      style={{
        padding: "clamp(64px, 8vw, 100px) clamp(16px, 5vw, 72px)",
        background: "linear-gradient(160deg, var(--canvas), color-mix(in srgb, var(--card) 38%, var(--canvas)))",
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setIsHovered(false);
      }}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
          setFocusPaused(true);
        }
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setFocusPaused(false);
        }
      }}
    >
      <div className="mx-auto mb-5 w-full max-w-full" style={{ maxWidth: 880 }}>
        <span className="swatch-tag mb-4">Social Proof</span>
        <h2
          id="testimonials-title"
          className="font-display font-bold leading-[1.12]"
          style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}
        >
          People who&apos;ve<br />worked with me.
        </h2>
        <p className="mt-3 max-w-[560px] text-[14px] leading-[1.65] sm:text-[16px]" style={{ color: "var(--dim)" }}>
          Firsthand notes from the teammates, clients, and colleagues I’ve worked with.
        </p>
      </div>

      <div
        className="relative mx-auto w-full max-w-full border px-[22px] py-6 shadow-[0_30px_70px_-20px_rgba(28,32,54,0.18),inset_0_1px_0_0_var(--glass-highlight)] sm:px-10 sm:py-8 lg:px-[52px] lg:py-9"
        style={{
          maxWidth: 880,
          borderRadius: 4,
          borderColor: "var(--glass-border)",
          background: "var(--glass-bg-strong)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
        }}
      >
        <div className="grid min-w-0 grid-cols-1 items-center gap-2 min-[50rem]:grid-cols-[360px_minmax(0,1fr)] min-[50rem]:gap-[34px]">
          <div
            ref={orbitViewportRef}
            role="group"
            aria-label="Testimonial reviewers"
            className="relative mx-auto w-full max-w-[360px] overflow-visible"
            style={{ height: ORBIT_HEIGHT * orbitScale }}
          >
            <div
              className="absolute left-1/2 top-0"
              style={{
                width: ORBIT_WIDTH,
                height: ORBIT_HEIGHT,
                transform: `translateX(-50%) scale(${orbitScale})`,
                transformOrigin: "top center",
              }}
            >
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox={`0 0 ${ORBIT_WIDTH} ${ORBIT_HEIGHT}`}
                preserveAspectRatio="none"
                style={{
                  maskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)",
                  WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)",
                }}
              >
                <path
                  d={(() => {
                    const start = pointOnOrbit(-ARC_LIMIT);
                    const end = pointOnOrbit(ARC_LIMIT);
                    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`;
                  })()}
                  fill="none"
                  stroke="var(--rim)"
                  strokeWidth="1.2"
                />
              </svg>

            {testimonials.map((testimonial, index) => {
              const color = ERA_COLORS[testimonial.era];
              const isSelected = index === activeIndex;
              return (
                <button
                  key={testimonial.id || `${testimonial.name}-${index}`}
                  ref={(node) => { reviewerRefs.current[index] = node; }}
                  type="button"
                  aria-label={`Show ${testimonial.name}, ${testimonial.role}${testimonial.company ? ` at ${testimonial.company}` : ""}`}
                  aria-pressed={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className="absolute left-0 top-0 inline-flex min-h-11 items-center whitespace-nowrap rounded-lg border-0 bg-transparent p-0 text-left outline-none transition-[filter] focus-visible:z-20 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-(--brand)"
                  style={{ color: "var(--ink)", opacity: 0, pointerEvents: "none" }}
                  onClick={() => selectReviewer(index)}
                  onKeyDown={(event) => handleReviewerKeyDown(event, index)}
                >
                  <OrbitAvatar testimonial={testimonial} color={color} />
                  <span className="min-w-0 pr-2">
                    <span data-orbit-name className="block leading-tight" style={{ color: "var(--ink)" }}>
                      {testimonial.name}
                    </span>
                    <span data-orbit-label className="block leading-tight" style={{ marginTop: 4 }}>
                      <span data-orbit-role style={{ color: "var(--dim)" }}>
                        {[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 min-[50rem]:gap-4">
            <div className="hidden items-center justify-end min-[50rem]:flex">
              <RelationshipBadge
                era={selected.era}
                className="px-3.5 py-2 text-[10px] tracking-[0.2em]"
              />
            </div>

            <div className="relative min-h-[150px] pl-5">
              <span
                aria-hidden="true"
                className="absolute -left-0.5 -top-1 font-serif text-[26px] italic leading-none"
                style={{ color: "var(--rim-sub)" }}
              >
                “
              </span>
              <AnimatePresence initial={false} mode="wait">
                <motion.blockquote
                  key={selected.id || `${selected.name}-${activeIndex}`}
                  variants={quoteVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reducedMotion ? { duration: 0 } : undefined}
                  className="font-serif text-[15px] italic leading-[1.65] sm:leading-[1.85]"
                  style={{ color: "var(--ink)" }}
                >
                  <span className="first-letter:text-[1.5em]">{selected.quote}</span>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <div className="flex flex-nowrap items-center justify-between gap-2 pt-1 min-[50rem]:justify-end min-[50rem]:gap-4 min-[50rem]:pl-5">
              <div className="min-[50rem]:hidden">
                <RelationshipBadge
                  era={selected.era}
                  className="whitespace-nowrap px-2 py-1.5 text-[9px] tracking-[0.08em]"
                />
              </div>
              {selected.linkedin && (
                <ButtonLink
                  href={selected.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="md"
                  className="min-h-11 px-2 text-[11px] min-[50rem]:px-5 min-[50rem]:text-[14px]"
                >
                  Verify on LinkedIn
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
