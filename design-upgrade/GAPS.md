# Capability gaps — ui-design-upgrade run on DevCraft

Recorded up front per the skill's own rule: a documented gap is acceptable, a silent one is not.

| Capability | Status | Consequence |
|---|---|---|
| Fetch/browse web pages | **Available** (web_search / web_fetch tools) | Phase 1 references can be tier A (live-read) where the site actually loads content through those tools, not the sandbox's restricted bash network. |
| Vision / screenshots of the *live app* | **Not available** — no dev server, no Postgres, no headless browser in this container | Cannot capture "before" screenshots of the running app. The audit is **static**: read from source, not from rendered pixels. |
| Shell + Python | Available, but `scripts/inventory.py`, `scripts/slop_lint.py`, `scripts/tokens_build.py` and every file under `references/` **do not exist** in this installation of the skill — only `SKILL.md` itself is present | Inventory is done by grep/manual reading with numbers marked *estimated*, not exact. The lint pass is a manual checklist against `SKILL.md`'s own inline rules plus the mandates in the user-supplied `DESIGN.md`, not the automated linter. Token contrast validation is done by eye/formula, not the build script. |
| Headless browser / screenshot of the showcase | Not available | Phase 4/5 visual QA (360/768/1280 screenshots) will be skipped; noted as unverified in `05-verification.md` when we get there. |
| Run the app | Not available (no DB) | Confirmed above under screenshots. |
| File write | Available | All deliverables below are real files in `design-upgrade/`, not inlined text. |

**Net effect:** this run proceeds at the fidelity the skill calls "lower fidelity" — real code audit, real (where fetchable) reference reading, no rendered screenshots of either the current app or the new showcase. Anything claimed as seen rather than read will say so.

**Open item blocking Phase 3 (brand synthesis):** the user-supplied `DESIGN.md`'s example showcase template (§5) is branded `STITCHBOOK CORE` — the name of the user's *other* product (a tailoring-shop SaaS, tracked separately). Its principle-level rules (§1, §4) read as product-agnostic and are being treated as inputs to DevCraft's audit below. Its literal pixel values (indigo/slate palette, `#0B0F19` canvas, JetBrains Mono, `rounded-[4px]`/`rounded-[8px]` radii) are **not** being adopted for DevCraft without confirmation — see the question at the end of `03-brand.md` once it exists. Adopting them wholesale would silently overwrite DevCraft's already-established "Desert Monarch" identity, which is exactly the "reference collage / wholesale cloning" failure mode this skill warns against.
