import React from "react";
import { RupeeCoins } from "./RupeeCoins";
import { StockMarket } from "./StockMarket";
import { BankBuilding } from "./BankBuilding";
import { RocketGrowth } from "./RocketGrowth";
import { TechCircuit } from "./TechCircuit";
import { EnergyBolt } from "./EnergyBolt";
import { FactoryGears } from "./FactoryGears";
import { GlobeTradeVis } from "./GlobeTradeVis";
import { PeopleNetwork } from "./PeopleNetwork";
import { CityBuildings } from "./CityBuildings";
import { AgriWheat } from "./AgriWheat";
import { HealthMedical } from "./HealthMedical";
import { EducationBooks } from "./EducationBooks";
import { FloatingParticles } from "../illustrations/FloatingParticles";

/**
 * All available visual theme keys.
 * The LLM picks one per scene based on article content.
 */
export const VISUAL_KEYS = [
  "rupee", "market", "bank", "growth", "tech",
  "energy", "industry", "trade", "people", "realestate",
  "agriculture", "health", "education",
] as const;

export type VisualKey = (typeof VISUAL_KEYS)[number];

const VISUAL_MAP: Record<VisualKey, React.FC<{ color?: string }>> = {
  rupee: RupeeCoins,
  market: StockMarket,
  bank: BankBuilding,
  growth: RocketGrowth,
  tech: TechCircuit,
  energy: EnergyBolt,
  industry: FactoryGears,
  trade: GlobeTradeVis,
  people: PeopleNetwork,
  realestate: CityBuildings,
  agriculture: AgriWheat,
  health: HealthMedical,
  education: EducationBooks,
};

interface SceneVisualProps {
  visual?: string;
  color?: string;
  /** Fallback seed for generic particles when visual is unknown */
  seed?: number;
}

/**
 * Renders the article-relevant animated SVG illustration for a scene.
 * Falls back to generic FloatingParticles if visual key is unknown.
 */
export const SceneVisual: React.FC<SceneVisualProps> = ({ visual, color, seed = 42 }) => {
  if (!visual) {
    return <FloatingParticles count={10} color={color || "rgba(255,255,255,0.1)"} seed={seed} style="dots" />;
  }

  const Component = VISUAL_MAP[visual as VisualKey];
  if (!Component) {
    return <FloatingParticles count={10} color={color || "rgba(255,255,255,0.1)"} seed={seed} style="dots" />;
  }

  return <Component color={color} />;
};
