"use client";

import { Children, useState, type ReactNode } from "react";
import type { Era } from "@devcraft/types";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PROJECTS_PER_BATCH = 3;

interface ProjectRevealListProps {
  era: Era;
  children: ReactNode;
}

export function ProjectRevealList({ era, children }: ProjectRevealListProps) {
  const projects = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(
    Math.min(PROJECTS_PER_BATCH, projects.length),
  );
  const listId = `project-list-${era.toLowerCase()}`;
  const remainingCount = projects.length - visibleCount;
  const nextBatchSize = Math.min(PROJECTS_PER_BATCH, remainingCount);

  return (
    <>
      <div
        id={listId}
        className="reveal-group grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))" }}
      >
        {projects.slice(0, visibleCount)}
      </div>

      {remainingCount > 0 && (
        <div className="mt-7 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            size="md"
            aria-controls={listId}
            aria-label={`Show ${nextBatchSize} more ${nextBatchSize === 1 ? "project" : "projects"} in the ${era.toLowerCase()} era`}
            iconTrailing={<ChevronDown size={16} aria-hidden="true" />}
            onClick={() => {
              setVisibleCount((count) => Math.min(count + PROJECTS_PER_BATCH, projects.length));
            }}
          >
            More projects ({remainingCount} remaining)
          </Button>
        </div>
      )}
    </>
  );
}
