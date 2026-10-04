import type { ReactElement } from "react";
import { D3RadialSkills } from "@/components/dashboard/D3Charts";

interface Skill {
  label: string;
  value: number;
}

interface SkillsRadarProps {
  data: Skill[];
}

export function SkillsRadar({ data }: SkillsRadarProps): ReactElement {
  return <D3RadialSkills data={data} size={260} />;
}
