export interface BeamData {
  length: number;
  units: {
    length: string;
    force: string;
  };
}

export interface UnitPair {
  length: string;
  force: string;
  label: string;
}

export const UNIT_PAIRS: UnitPair[] = [
  { length: 'm', force: 'kN', label: 'm, kN' },
  { length: 'mm', force: 'kN', label: 'mm, kN' },
  { length: 'm', force: 'N', label: 'm, N' },
  { length: 'mm', force: 'N', label: 'mm, N' },
  { length: 'ft', force: 'kips', label: 'ft, kips' },
];

export interface Support {
  type: 'pin+roller' | 'fixed';
  pin_x?: number;
  roller_x?: number;
  fixed_pos?: 'left' | 'right';
}

export interface PointLoad {
  label: string;
  x: number;
  P: number; // +up, -down
}

export interface AngledLoad {
  label: string;
  x: number;
  P: number;
  theta_deg: number; // counterclockwise from +x
}

export interface UDLLoad {
  label: string;
  a: number; // start position
  b: number; // end position
  w: number; // intensity (+up, -down)
}

export interface UVLLoad {
  label: string;
  a: number; // start position
  b: number; // end position
  w1: number; // intensity at start (+up, -down)
  w2: number; // intensity at end (+up, -down)
}

export interface MomentLoad {
  label: string;
  x: number;
  M: number; // +counterclockwise
}

export interface Loads {
  point: PointLoad[];
  angled: AngledLoad[];
  udl: UDLLoad[];
  uvl: UVLLoad[];
  moment: MomentLoad[];
}

export interface Reaction {
  type: 'vertical' | 'moment' | 'horizontal';
  at: string;
  x?: number;
  R?: number;
  M?: number;
  H?: number;
}

export interface DiagramSegment {
  a: number;
  b: number;
  type: 'const' | 'linear' | 'quadratic' | 'cubic';
  V_a?: number;
  V_b?: number;
  M_a?: number;
  M_b?: number;
  coeffs?: number[];
}

export interface AnalysisResult {
  reactions: Reaction[];
  events: number[]; // sorted knots
  V_segments: DiagramSegment[];
  M_segments: DiagramSegment[];
  extrema: {
    Vmax: number;
    Vmin: number;
    Mmax: number;
    Mmin: number;
    positions: {
      Vmax_pos: number;
      Vmin_pos: number;
      Mmax_pos: number;
      Mmin_pos: number;
    };
  };
  isValid: boolean;
  error?: string;
}

// Legacy types for backward compatibility during transition
export interface LegacyLoad {
  id: string;
  position: number;
  magnitude: number;
}

export interface LegacySupport {
  type: string;
  positions: number[];
}

export interface LegacyAnalysisResult {
  reactions: {
    [key: string]: number;
  };
  shearForce: {
    x: number[];
    y: number[];
  };
  bendingMoment: {
    x: number[];
    y: number[];
  };
  maxShear: {
    position: number;
    value: number;
  };
  maxMoment: {
    position: number;
    value: number;
  };
  isValid: boolean;
  error?: string;
}
