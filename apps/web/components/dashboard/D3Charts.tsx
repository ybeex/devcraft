"use client";

import { useEffect, useRef, useMemo, useState, type ReactElement } from "react";
import * as d3 from "d3";
import { cssVar as getCSSVar } from "@/lib/cssVar";

// ── DARK MODE WATCHER (BUG-04 fix) ───────────────────────────────────────────
// Charts read CSS custom properties at draw time. This hook forces a redraw
// when `.dark` is toggled on <html>, so chart colors stay correct.

function useDarkMode(): boolean {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const check = (): void => setDark(document.documentElement.classList.contains("dark"));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return (): void => mo.disconnect();
  }, []);

  return dark;
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(ref.current);
    setWidth(ref.current.clientWidth);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

// getCSSVar re-exported from the shared lib/cssVar.ts resolver (was a local
// duplicate of the exact same function — the site-wide fallback values now
// live in exactly one place).

// ── SHARED TYPES ──────────────────────────────────────────────────────────────

export interface DayCount {
  date:  string;
  count: number;
}

export interface NameCount {
  name?:     string;
  path?:     string;
  referrer?: string;
  count:     number;
}

interface BarItem {
  label: string;
  value: number;
}

// ── 1. D3 AREA CHART ─────────────────────────────────────────────────────────

interface D3AreaChartProps {
  data:    DayCount[];
  color?:  string;
  label?:  string;
  height?: number;
}

export function D3AreaChart({
  data,
  color,
  label = "Views",
  height = 200,
}: D3AreaChartProps): ReactElement {
  const svgRef  = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dark    = useDarkMode();
  const containerWidth = useContainerWidth(wrapRef);

  useEffect((): (() => void) | void => {
    const svg:  SVGSVGElement | null  = svgRef.current;
    const wrap: HTMLDivElement | null = wrapRef.current;
    if (!svg || !wrap || data.length === 0) return;

    const brandColor: string = color ?? getCSSVar("--brand", "#d4ac55");
    const dimColor:   string = getCSSVar("--dim", "#5b5847");
    const rimColor:   string = getCSSVar("--rim", "#c7b78c");

    const margin = { top: 10, right: 12, bottom: 28, left: 32 } as const;
    const innerW: number = Math.max(0, (containerWidth || wrap.clientWidth) - margin.left - margin.right);
    const innerH: number = height - margin.top - margin.bottom;

    d3.select(svg).selectAll("*").remove();

    const root = d3
      .select(svg)
      .attr("width", innerW + margin.left + margin.right)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xDomain: [Date, Date] = d3.extent(data, (d: DayCount): Date => new Date(d.date)) as [Date, Date];
    const x = d3.scaleTime().domain(xDomain).range([0, innerW]);

    const yMax: number = d3.max(data, (d: DayCount): number => d.count) ?? 1;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerH, 0]);

    root
      .append("g")
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat((): string => ""))
      .call((g: d3.Selection<SVGGElement, unknown, null, undefined>): void => {
        g.select(".domain").remove();
        g.selectAll("line")
          .attr("stroke", rimColor)
          .attr("stroke-dasharray", "3,3")
          .attr("opacity", 0.5);
      });

    const gradId = `area-grad-${Math.random().toString(36).slice(2)}`;
    const defs   = root.append("defs");
    const grad   = defs
      .append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    grad.append("stop").attr("offset", "0%").attr("stop-color", brandColor).attr("stop-opacity", 0.3);
    grad.append("stop").attr("offset", "100%").attr("stop-color", brandColor).attr("stop-opacity", 0.02);

    const area = d3
      .area<DayCount>()
      .x((d: DayCount): number => x(new Date(d.date)))
      .y0(innerH)
      .y1((d: DayCount): number => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    root.append("path").datum(data).attr("fill", `url(#${gradId})`).attr("d", area);

    const line = d3
      .line<DayCount>()
      .x((d: DayCount): number => x(new Date(d.date)))
      .y((d: DayCount): number => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", brandColor)
      .attr("stroke-width", 2.2)
      .attr("d", line);

    const node: SVGPathElement | null = path.node();
    const pathLen: number = node ? node.getTotalLength() : 0;
    path
      .attr("stroke-dasharray", `${pathLen} ${pathLen}`)
      .attr("stroke-dashoffset", pathLen)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    root
      .append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3.axisBottom(x).ticks(6).tickFormat((d: Date | d3.NumberValue): string =>
          d3.timeFormat("%b %d")(d as Date)
        )
      )
      .call((g: d3.Selection<SVGGElement, unknown, null, undefined>): void => {
        g.select(".domain").remove();
        g.selectAll("tick line").remove();
        g.selectAll("text").attr("fill", dimColor).attr("font-size", 10);
      });

    root
      .append("g")
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format("~s")))
      .call((g: d3.Selection<SVGGElement, unknown, null, undefined>): void => {
        g.select(".domain").remove();
        g.selectAll(".tick line").remove();
        g.selectAll("text").attr("fill", dimColor).attr("font-size", 10);
      });

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "fixed")
      .style("background", getCSSVar("--raised", "#dcd0af"))
      .style("border", `1px solid ${rimColor}`)
      .style("border-radius", "10px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("color", getCSSVar("--ink", "#1c2036"))
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("z-index", "9999")
      .style("transition", "opacity .15s");

    const bisect = d3.bisector<DayCount, Date>((d: DayCount): Date => new Date(d.date)).left;

    root
      .append("rect")
      .attr("width", innerW)
      .attr("height", innerH)
      .attr("fill", "transparent")
      .on("mousemove", function (this: SVGRectElement, event: MouseEvent): void {
        const [mouseX]: [number, number] = d3.pointer(event, this);
        const x0: Date = x.invert(mouseX);
        const idx: number = bisect(data, x0, 1);
        const point: DayCount | undefined = data[idx - 1];
        if (!point) return;

        tooltip
          .style("opacity", "1")
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY - 28}px`)
          .html(`<strong>${point.date}</strong><br/>${label}: <strong>${point.count}</strong>`);
      })
      .on("mouseleave", (): void => {
        tooltip.style("opacity", "0");
      });

    return (): void => {
      tooltip.remove();
    };
  }, [data, color, label, height, dark, containerWidth]);

  return (
    <div ref={wrapRef} className="w-full">
      <svg ref={svgRef} className="w-full overflow-visible" />
    </div>
  );
}

// ── 2. D3 DONUT ───────────────────────────────────────────────────────────────

export interface DonutSlice {
  name:  string;
  value: number;
  color: string;
}

interface D3DonutProps {
  data: DonutSlice[];
  size?: number;
}

export function D3Donut({ data, size = 160 }: D3DonutProps): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dark   = useDarkMode();

  useEffect((): void => {
    const svg: SVGSVGElement | null = svgRef.current;
    if (!svg || data.length === 0) return;

    const outerR: number = size / 2;
    const innerR: number = outerR * 0.58;
    const total:  number = d3.sum(data, (d: DonutSlice): number => d.value);

    d3.select(svg).selectAll("*").remove();

    const root = d3
      .select(svg)
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${outerR},${outerR})`);

    const pie = d3.pie<DonutSlice>().value((d: DonutSlice): number => d.value).sort(null).padAngle(0.03);
    const arc = d3
      .arc<d3.PieArcDatum<DonutSlice>>()
      .innerRadius(innerR)
      .outerRadius(outerR - 2)
      .cornerRadius(4);

    const arcs = root
      .selectAll<SVGPathElement, d3.PieArcDatum<DonutSlice>>("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", (d: d3.PieArcDatum<DonutSlice>): string => d.data.color)
      .attr("d", arc)
      .style("opacity", 0.9);

    arcs.each(function (this: SVGPathElement, d: d3.PieArcDatum<DonutSlice>): void {
      const el  = d3.select<SVGPathElement, d3.PieArcDatum<DonutSlice>>(this);
      const end: d3.PieArcDatum<DonutSlice> = { ...d };
      d.endAngle = d.startAngle;

      el.transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attrTween("d", function (this: SVGPathElement, current: d3.PieArcDatum<DonutSlice>) {
          const interpolate = d3.interpolate(current, end);
          return (t: number): string => arc(interpolate(t)) ?? "";
        });
    });

    root
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("font-size", 20)
      .attr("font-weight", 700)
      .attr("fill", getCSSVar("--ink", "#1c2036"))
      .attr("font-family", "var(--font-dm), system-ui, sans-serif")
      .text(total.toLocaleString());

    root
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.1em")
      .attr("font-size", 10)
      .attr("fill", getCSSVar("--ghost", "#93876b"))
      .text("total");
  }, [data, size, dark]);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg ref={svgRef} />
      <div className="flex flex-col gap-1.5 w-full">
        {data.map((d: DonutSlice): ReactElement => (
          <div key={d.name} className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span style={{ color: "var(--dim)" }}>{d.name}</span>
            </span>
            <span className="font-mono font-semibold" style={{ color: "var(--ink)" }}>
              {d.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. D3 HORIZONTAL BAR ──────────────────────────────────────────────────────

interface D3HBarChartProps {
  data:     NameCount[];
  color?:   string;
  height?:  number;
  maxItems?: number;
}

export function D3HBarChart({
  data,
  color,
  height = 200,
  maxItems = 8,
}: D3HBarChartProps): ReactElement {
  const svgRef  = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dark    = useDarkMode();
  const containerWidth = useContainerWidth(wrapRef);

  const items: BarItem[] = useMemo(
    (): BarItem[] =>
      data.slice(0, maxItems).map((d: NameCount): BarItem => ({
        label: (d.path ?? d.referrer ?? d.name ?? "—").replace(/^https?:\/\//, ""),
        value: d.count,
      })),
    [data, maxItems]
  );

  useEffect((): void => {
    const svg:  SVGSVGElement | null  = svgRef.current;
    const wrap: HTMLDivElement | null = wrapRef.current;
    if (!svg || !wrap || items.length === 0) return;

    const brandColor: string = color ?? getCSSVar("--brand", "#d4ac55");
    const margin = { top: 6, right: 40, bottom: 6, left: 120 } as const;
    const currentW = containerWidth || wrap.clientWidth;
    const innerW: number = Math.max(0, currentW - margin.left - margin.right);

    d3.select(svg).selectAll("*").remove();

    const root = d3
      .select(svg)
      .attr("width", currentW)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xMax: number = d3.max(items, (d: BarItem): number => d.value) ?? 1;
    const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);

    const y = d3
      .scaleBand<string>()
      .domain(items.map((d: BarItem): string => d.label))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.28);

    root
      .selectAll<SVGRectElement, BarItem>("rect")
      .data(items)
      .enter()
      .append("rect")
      .attr("y", (d: BarItem): number => y(d.label) ?? 0)
      .attr("height", y.bandwidth())
      .attr("rx", 5)
      .attr("fill", brandColor)
      .attr("opacity", (_d: BarItem, i: number): number => 1 - i * 0.1)
      .attr("x", 0)
      .attr("width", 0)
      .transition()
      .duration(600)
      .delay((_d: BarItem, i: number): number => i * 60)
      .ease(d3.easeCubicOut)
      .attr("width", (d: BarItem): number => x(d.value));

    root
      .selectAll<SVGTextElement, BarItem>(".lbl")
      .data(items)
      .enter()
      .append("text")
      .attr("class", "lbl")
      .attr("x", -8)
      .attr("y", (d: BarItem): number => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", getCSSVar("--dim", "#5b5847"))
      .text((d: BarItem): string => (d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label));

    root
      .selectAll<SVGTextElement, BarItem>(".val")
      .data(items)
      .enter()
      .append("text")
      .attr("class", "val")
      .attr("x", (d: BarItem): number => x(d.value) + 6)
      .attr("y", (d: BarItem): number => (y(d.label) ?? 0) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .attr("fill", getCSSVar("--ink", "#1c2036"))
      .text((d: BarItem): string => d.value.toLocaleString());
  }, [items, color, height, dark, containerWidth]);

  return (
    <div ref={wrapRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}

// ── 4. D3 RADIAL SKILLS ───────────────────────────────────────────────────────

export interface RadialSkill {
  label: string;
  value: number; // 0–100
}

interface D3RadialSkillsProps {
  data: RadialSkill[];
  size?: number;
}

export function D3RadialSkills({ data, size = 240 }: D3RadialSkillsProps): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dark   = useDarkMode();

  useEffect(() => {
    const svg: SVGSVGElement | null = svgRef.current;
    if (!svg || data.length === 0) return;

    const brand:  string = getCSSVar("--brand", "#d4ac55");
    const indigo: string = getCSSVar("--indigo", "#6d8ddb");
    const dim:    string = getCSSVar("--dim", "#5b5847");
    const rim:    string = getCSSVar("--rim", "#c7b78c");
    const font:   string = getCSSVar("--font-body", "system-ui, sans-serif");
    const r:      number = size / 2 - 36;
    const cx:     number = 220;
    const cy:     number = 150;
    const n:      number = data.length;

    d3.select(svg).selectAll("*").remove();
    const svgSel = d3.select(svg)
      .attr("viewBox", "0 0 440 300")
      .attr("width", 440)
      .attr("height", 300);

    // Refined: a soft center-out gradient fill (rather than a flat
    // fill-opacity) and a matching glow filter on the outline, so the
    // shape reads with some real depth instead of a single flat wash —
    // reuses the same brand/indigo pairing as the rest of the site
    // instead of introducing new colors.
    const defs = svgSel.append("defs");
    const gradient = defs.append("radialGradient").attr("id", "radial-skill-fill");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", brand).attr("stop-opacity", 0.35);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", indigo).attr("stop-opacity", 0.12);

    const glow = defs.append("filter").attr("id", "radial-skill-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const root = svgSel.append("g");

    const angle = (i: number): number => i * ((2 * Math.PI) / n) - Math.PI / 2;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, r]);

    // Grid rings keep the radar scale legible without adding numeric labels.
    ([25, 50, 75, 100] as const).forEach((pct: number): void => {
      const ringR: number = rScale(pct);
      const points: string = data
        .map((_d: RadialSkill, i: number): string => {
          const a: number = angle(i);
          return `${cx + ringR * Math.cos(a)},${cy + ringR * Math.sin(a)}`;
        })
        .join(" ");
      root.append("polygon")
        .attr("points", points)
        .attr("fill", "none")
        .attr("stroke", rim)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", pct === 100 ? "none" : "2,3")
        .attr("opacity", pct === 100 ? 0.55 : 0.35);

    });

    data.forEach((_d: RadialSkill, i: number): void => {
      const a: number = angle(i);
      root
        .append("line")
        .attr("x1", cx).attr("y1", cy)
        .attr("x2", cx + r * Math.cos(a)).attr("y2", cy + r * Math.sin(a))
        .attr("stroke", rim).attr("stroke-width", 1).attr("opacity", 0.4);
    });

    const points: [number, number][] = data.map((d: RadialSkill, i: number): [number, number] => {
      const ringR: number = rScale(d.value);
      const a:     number = angle(i);
      return [cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)];
    });

    const shape = root
      .append("polygon")
      .attr("points", points.map((p: [number, number]): string => p.join(",")).join(" "))
      .attr("fill", "url(#radial-skill-fill)")
      .attr("stroke", brand)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("filter", "url(#radial-skill-glow)")
      .attr("opacity", 1);

    const dotRings = root
      .selectAll<SVGCircleElement, [number, number]>("circle.dot-ring")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "dot-ring")
      .attr("cx", (d: [number, number]): number => d[0])
      .attr("cy", (d: [number, number]): number => d[1])
      .attr("r", 6)
      .attr("fill", "none")
      .attr("stroke", brand)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.35);

    const dots = root
      .selectAll<SVGCircleElement, [number, number]>("circle.dot")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d: [number, number]): number => d[0])
      .attr("cy", (d: [number, number]): number => d[1])
      .attr("r", 3.5)
      .attr("fill", brand);

    let cancelled = false;
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && points.length > 0) {
      const pulseNext = (index: number): void => {
        if (cancelled) return;

        const dot = dots.filter((_point: [number, number], dotIndex: number) => dotIndex === index);
        const ring = dotRings.filter((_point: [number, number], ringIndex: number) => ringIndex === index);

        ring
          .transition("radar-dot-pulse")
          .duration(360)
          .ease(d3.easeCubicOut)
          .attr("r", 10)
          .attr("opacity", 0.8)
          .transition()
          .duration(360)
          .ease(d3.easeCubicIn)
          .attr("r", 6)
          .attr("opacity", 0.35);

        dot
          .transition("radar-dot-pulse")
          .duration(360)
          .ease(d3.easeCubicOut)
          .attr("r", 5)
          .attr("opacity", 0.7)
          .transition()
          .duration(360)
          .ease(d3.easeCubicIn)
          .attr("r", 3.5)
          .attr("opacity", 1)
          .on("end", () => pulseNext((index + 1) % points.length));
      };

      pulseNext(0);
    }

    data.forEach((d: RadialSkill, i: number): void => {
      const a:  number = angle(i);
      const lx: number = cx + (r + 22) * Math.cos(a);
      const ly: number = cy + (r + 22) * Math.sin(a);
      root
        .append("text")
        .attr("x", lx)
        .attr("y", ly)
        .attr("text-anchor", Math.cos(a) > 0.05 ? "start" : Math.cos(a) < -0.05 ? "end" : "middle")
        .attr("dy", "0.35em")
        .attr("font-size", 11)
        .attr("font-family", font)
        .attr("font-weight", 600)
        .attr("fill", dim)
        .text(d.label);
    });

    return () => {
      cancelled = true;
      dotRings.interrupt("radar-dot-pulse");
      dots.interrupt("radar-dot-pulse");
    };
  }, [data, size, dark]);

  return <svg ref={svgRef} style={{ width: "100%", height: "auto", overflow: "visible" }} />;
}

// ── 5. D3 SPARKLINE ───────────────────────────────────────────────────────────

interface D3SparklineProps {
  data:    number[];
  color?:  string;
  width?:  number;
  height?: number;
}

export function D3Sparkline({
  data,
  color,
  width = 80,
  height = 32,
}: D3SparklineProps): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dark   = useDarkMode();

  useEffect((): void => {
    const svg: SVGSVGElement | null = svgRef.current;
    if (!svg || data.length === 0) return;

    const brand: string = color ?? getCSSVar("--brand", "#d4ac55");

    d3.select(svg).selectAll("*").remove();

    const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
    const yMin: number = d3.min(data) ?? 0;
    const yMax: number = d3.max(data) ?? 1;
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height - 2, 2]);

    const line = d3
      .line<number>()
      .x((_d: number, i: number): number => x(i))
      .y((d: number): number => y(d))
      .curve(d3.curveCatmullRom);

    d3.select(svg)
      .attr("width", width)
      .attr("height", height)
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", brand)
      .attr("stroke-width", 1.8)
      .attr("stroke-linecap", "round")
      .attr("d", line);
  }, [data, color, width, height, dark]);

  return <svg ref={svgRef} />;
}
