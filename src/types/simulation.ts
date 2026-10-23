export type DomainType = 'physics' | 'anatomy' | 'circuits' | 'aerospace' | 'custom';

export type GradeLevel = 'K-5 (Elementary)' | '6-8 (Middle School)' | '9-12 (High School)' | 'College / Higher Ed';

export interface ComponentMetadata {
  formula?: string;
  keyMetric?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  temperature?: number;
  voltage?: number;
  rpm?: number;
  pressure?: number;
  flowRate?: number;
  role?: string;
}

export interface SimulationComponent {
  id: string;
  name: string;
  type: 'sphere' | 'box' | 'cylinder' | 'torus' | 'ring' | 'capsule' | 'cone' | 'wire' | 'custom';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  roughness: number;
  metalness: number;
  mass: number; // 0 is static, >0 is dynamic
  restitution?: number;
  description: string;
  explodedOffset?: [number, number, number]; // Vector to expand along during exploded view
  metadata?: ComponentMetadata;
  // Dynamic runtime state
  velocity?: [number, number, number];
  currentPos?: [number, number, number];
}

export interface PhysicsConfig {
  gravity: [number, number, number];
  restitution: number;
  friction: number;
  airResistance: number;
  timeScale: number;
  damping: number;
}

export interface SimulationLab {
  id: string;
  title: string;
  domain: DomainType;
  description: string;
  learningObjectives: string[];
  physicsConfig: PhysicsConfig;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  components: SimulationComponent[];
  socraticPrompts: string[];
  hasExplodedView?: boolean;
  hasParticles?: boolean;
}

export interface TutorMessage {
  id: string;
  sender: 'student' | 'mentor';
  text: string;
  timestamp: string;
  audioBase64?: string;
  isStreaming?: boolean;
}

export interface SimulationTelemetry {
  timeElapsed: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  activeVelocity: number;
  impactCount: number;
  isSimulating: boolean;
  selectedComponentId: string | null;
  explodedAmount: number;
  currentGravityName: string;
}
