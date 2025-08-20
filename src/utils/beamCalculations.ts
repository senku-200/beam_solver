import { 
  BeamData, 
  Support, 
  Loads, 
  AnalysisResult, 
  Reaction, 
  DiagramSegment
} from '@/types/beam';

// Base units for internal calculations (m, N, N·m)
const BASE_UNITS = { length: 'm', force: 'N' };

// Unit conversion factors
const LENGTH_CONVERSIONS: { [key: string]: number } = {
  'm': 1,
  'mm': 0.001,
  'ft': 0.3048,
};

const FORCE_CONVERSIONS: { [key: string]: number } = {
  'N': 1,
  'kN': 1000,
  'kips': 4448.22,
};

export function calculateBeamAnalysis(
  beamData: BeamData,
  supports: Support,
  loads: Loads
): AnalysisResult {
  try {
    // Validate inputs
    if (beamData.length <= 0) {
      return createErrorResult('Beam length must be greater than 0');
    }

    // Convert to base units
    const baseLength = convertLength(beamData.length, beamData.units.length, BASE_UNITS.length);
    const baseLoads = convertLoadsToBaseUnits(loads, beamData.units);
    const baseSupports = convertSupportsToBaseUnits(supports, beamData.units.length);

    // Validate support positions
    if (!validateSupports(baseSupports, baseLength)) {
      return createErrorResult('Invalid support configuration');
    }

    // Calculate reactions
    const reactions = calculateReactions(baseLoads, baseSupports, baseLength);
    
    // Generate events (knots)
    const events = generateEvents(baseLoads, baseSupports, baseLength);
    
    // Calculate shear force and bending moment segments
    const V_segments = calculateShearSegments(baseLoads, reactions, events, baseLength);
    const M_segments = calculateMomentSegments(V_segments, baseLoads, reactions, events, baseLength);
    
    // Find extrema
    const extrema = findExtrema(V_segments, M_segments, baseLoads, reactions, baseLength);
    
    // Convert results back to display units
    const displayReactions = convertReactionsToDisplayUnits(reactions, beamData.units);
    const displayVSegments = convertSegmentsToDisplayUnits(V_segments, beamData.units);
    const displayMSegments = convertSegmentsToDisplayUnits(M_segments, beamData.units);
    const displayExtrema = convertExtremaToDisplayUnits(extrema, beamData.units);
    const displayEvents = events.map(x => convertLength(x, BASE_UNITS.length, beamData.units.length));

    return {
      reactions: displayReactions,
      events: displayEvents,
      V_segments: displayVSegments,
      M_segments: displayMSegments,
      extrema: displayExtrema,
      isValid: true
    };
  } catch (error) {
    return createErrorResult(`Calculation error: ${error}`);
  }
}

function convertLength(value: number, fromUnit: string, toUnit: string): number {
  const fromFactor = LENGTH_CONVERSIONS[fromUnit] || 1;
  const toFactor = LENGTH_CONVERSIONS[toUnit] || 1;
  return (value * fromFactor) / toFactor;
}

function convertForce(value: number, fromUnit: string, toUnit: string): number {
  const fromFactor = FORCE_CONVERSIONS[fromUnit] || 1;
  const toFactor = FORCE_CONVERSIONS[toUnit] || 1;
  return (value * fromFactor) / toFactor;
}

function convertLoadsToBaseUnits(loads: Loads, units: { length: string; force: string }): Loads {
  return {
    point: loads.point.map(load => ({
      ...load,
      x: convertLength(load.x, units.length, BASE_UNITS.length),
      P: convertForce(load.P, units.force, BASE_UNITS.force)
    })),
    angled: loads.angled.map(load => ({
      ...load,
      x: convertLength(load.x, units.length, BASE_UNITS.length),
      P: convertForce(load.P, units.force, BASE_UNITS.force)
    })),
    udl: loads.udl.map(load => ({
      ...load,
      a: convertLength(load.a, units.length, BASE_UNITS.length),
      b: convertLength(load.b, units.length, BASE_UNITS.length),
      w: convertForce(load.w, units.force, BASE_UNITS.force) / convertLength(1, units.length, BASE_UNITS.length)
    })),
    uvl: loads.uvl.map(load => ({
      ...load,
      a: convertLength(load.a, units.length, BASE_UNITS.length),
      b: convertLength(load.b, units.length, BASE_UNITS.length),
      w1: convertForce(load.w1, units.force, BASE_UNITS.force) / convertLength(1, units.length, BASE_UNITS.length),
      w2: convertForce(load.w2, units.force, BASE_UNITS.force) / convertLength(1, units.length, BASE_UNITS.length)
    })),
    moment: loads.moment.map(load => ({
      ...load,
      x: convertLength(load.x, units.length, BASE_UNITS.length),
      M: convertForce(load.M, units.force, BASE_UNITS.force) * convertLength(1, units.length, BASE_UNITS.length)
    }))
  };
}

function convertSupportsToBaseUnits(supports: Support, lengthUnit: string): Support {
  if (supports.type === 'pin+roller') {
    return {
      ...supports,
      pin_x: convertLength(supports.pin_x || 0, lengthUnit, BASE_UNITS.length),
      roller_x: convertLength(supports.roller_x || 0, lengthUnit, BASE_UNITS.length)
    };
  }
  return supports;
}

function validateSupports(supports: Support, length: number): boolean {
  if (supports.type === 'pin+roller') {
    const pin_x = supports.pin_x || 0;
    const roller_x = supports.roller_x || length;
    return pin_x >= 0 && roller_x <= length && pin_x !== roller_x;
  }
  return true;
}

function calculateReactions(loads: Loads, supports: Support, length: number): Reaction[] {
  const reactions: Reaction[] = [];
  
  if (supports.type === 'pin+roller') {
    const pin_x = supports.pin_x || 0;
    const roller_x = supports.roller_x || length;
    
    // Calculate total vertical forces and moments
    let totalVerticalForce = 0;
    let totalMomentAboutPin = 0;
    let totalHorizontalForce = 0;
    
    // Point loads (positive = downward)
    loads.point.forEach(load => {
      totalVerticalForce += load.P;
      totalMomentAboutPin += load.P * (load.x - pin_x);
    });
    
    // Angled loads
    loads.angled.forEach(load => {
      const Px = load.P * Math.cos(load.theta_deg * Math.PI / 180);
      const Py = load.P * Math.sin(load.theta_deg * Math.PI / 180);
      totalVerticalForce += Py;
      totalMomentAboutPin += Py * (load.x - pin_x);
      totalHorizontalForce += Px;
    });
    
    // UDL loads
    loads.udl.forEach(load => {
      const R = load.w * (load.b - load.a);
      const xR = (load.a + load.b) / 2;
      totalVerticalForce += R;
      totalMomentAboutPin += R * (xR - pin_x);
    });
    
    // UVL loads
    loads.uvl.forEach(load => {
      const L = load.b - load.a;
      const R = (load.w1 + load.w2) * L / 2;
      if (Math.abs(load.w1 + load.w2) > 1e-10) {
        const xR = load.a + L * (load.w1 + 2 * load.w2) / (3 * (load.w1 + load.w2));
        totalVerticalForce += R;
        totalMomentAboutPin += R * (xR - pin_x);
      }
    });
    
    // Moments don't affect vertical equilibrium
    
    // Solve for reactions using the correct formula for simply supported beams
    // For simply supported beams:
    // RA = (1/L) * ΣPi * (L - ai)  where ai is the position of load Pi
    // RB = ΣPi - RA
    // Note: These give the reactions in the correct direction (upward = positive)
    const rollerReaction = totalMomentAboutPin / (roller_x - pin_x);
    const pinReaction = totalVerticalForce - rollerReaction;
    
    reactions.push(
      { type: 'vertical', at: 'pin', x: pin_x, R: pinReaction },
      { type: 'vertical', at: 'roller', x: roller_x, R: rollerReaction }
    );
    
    if (Math.abs(totalHorizontalForce) > 1e-10) {
      reactions.push({ type: 'horizontal', at: 'pin', H: -totalHorizontalForce });
    }
  } else if (supports.type === 'fixed') {
    const fixed_x = supports.fixed_pos === 'right' ? length : 0;
    
    // Calculate total forces and moments about fixed end
    let totalVerticalForce = 0;
    let totalMomentAboutFixed = 0;
    let totalHorizontalForce = 0;
    
    // Point loads
    loads.point.forEach(load => {
      totalVerticalForce += load.P;
      totalMomentAboutFixed += load.P * (load.x - fixed_x);
    });
    
    // Angled loads
    loads.angled.forEach(load => {
      const Px = load.P * Math.cos(load.theta_deg * Math.PI / 180);
      const Py = load.P * Math.sin(load.theta_deg * Math.PI / 180);
      totalVerticalForce += Py;
      totalMomentAboutFixed += Py * (load.x - fixed_x);
      totalHorizontalForce += Px;
    });
    
    // UDL loads
    loads.udl.forEach(load => {
      const R = load.w * (load.b - load.a);
      const xR = (load.a + load.b) / 2;
      totalVerticalForce += R;
      totalMomentAboutFixed += R * (xR - fixed_x);
    });
    
    // UVL loads
    loads.uvl.forEach(load => {
      const L = load.b - load.a;
      const R = (load.w1 + load.w2) * L / 2;
      if (Math.abs(load.w1 + load.w2) > 1e-10) {
        const xR = load.a + L * (load.w1 + 2 * load.w2) / (3 * (load.w1 + load.w2));
        totalVerticalForce += R;
        totalMomentAboutFixed += R * (xR - fixed_x);
      }
    });
    
    // Moments
    loads.moment.forEach(load => {
      totalMomentAboutFixed += load.M;
    });
    
    const fixedReaction = -totalVerticalForce;
    const fixedMoment = -totalMomentAboutFixed;
    
    reactions.push(
      { type: 'vertical', at: 'fixed', x: fixed_x, R: fixedReaction },
      { type: 'moment', at: 'fixed', x: fixed_x, M: fixedMoment }
    );
    
    if (Math.abs(totalHorizontalForce) > 1e-10) {
      reactions.push({ type: 'horizontal', at: 'fixed', H: -totalHorizontalForce });
    }
  }
  
  return reactions;
}

function generateEvents(loads: Loads, supports: Support, length: number): number[] {
  const events = new Set<number>();
  
  // Add beam ends
  events.add(0);
  events.add(length);
  
  // Add support positions
  if (supports.type === 'pin+roller') {
    events.add(supports.pin_x || 0);
    events.add(supports.roller_x || length);
  } else if (supports.type === 'fixed') {
    const fixed_x = supports.fixed_pos === 'right' ? length : 0;
    events.add(fixed_x);
  }
  
  // Add load positions
  loads.point.forEach(load => events.add(load.x));
  loads.angled.forEach(load => events.add(load.x));
  loads.udl.forEach(load => {
    events.add(load.a);
    events.add(load.b);
  });
  loads.uvl.forEach(load => {
    events.add(load.a);
    events.add(load.b);
  });
  loads.moment.forEach(load => events.add(load.x));
  
  return Array.from(events).sort((a, b) => a - b);
}

// Enhanced calculateShearSegments with proper coefficients
function calculateShearSegments(
  loads: Loads, 
  reactions: Reaction[], 
  events: number[], 
  length: number
): DiagramSegment[] {
  const segments: DiagramSegment[] = [];
  
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i];
    const b = events[i + 1];
    
    // Calculate shear at start of segment
    let V_a = 0;
    
    // Add reactions (positive upward)
    reactions.forEach(reaction => {
      if (reaction.type === 'vertical' && reaction.x !== undefined && reaction.x <= a) {
        V_a += reaction.R || 0;
      }
    });
    
    // Subtract point loads (positive downward)
    loads.point.forEach(load => {
      if (load.x <= a) {
        V_a -= load.P;
      }
    });
    
    // Subtract angled loads (vertical component)
    loads.angled.forEach(load => {
      if (load.x <= a) {
        const Py = load.P * Math.sin(load.theta_deg * Math.PI / 180);
        V_a -= Py;
      }
    });
    
    // Calculate accumulated shear from distributed loads up to point a
    loads.udl.forEach(load => {
      if (load.b <= a) {
        // Entire UDL is before point a
        V_a -= load.w * (load.b - load.a);
      } else if (load.a < a) {
        // UDL starts before point a but may extend beyond
        V_a -= load.w * (a - load.a);
      }
    });
    
    loads.uvl.forEach(load => {
      if (load.b <= a) {
        // Entire UVL is before point a
        V_a -= (load.w1 + load.w2) * (load.b - load.a) / 2;
      } else if (load.a < a) {
        // UVL starts before point a
        const x_rel = a - load.a;
        const L_total = load.b - load.a;
        const w_at_a = load.w1 + (load.w2 - load.w1) * x_rel / L_total;
        V_a -= (load.w1 + w_at_a) * x_rel / 2;
      }
    });
    
    // Now determine segment type and coefficients
    let segmentType: 'const' | 'linear' | 'quadratic' = 'const';
    let coeffs: number[] = [V_a]; // Default: constant
    
    // Check what loads affect this segment
    let hasUDL = false;
    let hasUVL = false;
    let udlRate = 0;
    let uvlW1 = 0;
    let uvlW2 = 0;
    let uvlStart = 0;
    let uvlLength = 0;
    
    // Check for UDL in this segment
    loads.udl.forEach(load => {
      if (load.a < b && load.b > a) {
        hasUDL = true;
        udlRate = -load.w; // Negative because load decreases shear
        segmentType = 'linear';
      }
    });
    
    // Check for UVL in this segment
    loads.uvl.forEach(load => {
      if (load.a < b && load.b > a) {
        hasUVL = true;
        const segStart = Math.max(load.a, a);
        const segEnd = Math.min(load.b, b);
        uvlStart = segStart;
        uvlLength = load.b - load.a;
        
        // Calculate load intensity at segment boundaries
        const x1_rel = (segStart - load.a) / uvlLength;
        const x2_rel = (segEnd - load.a) / uvlLength;
        uvlW1 = load.w1 + (load.w2 - load.w1) * x1_rel;
        uvlW2 = load.w1 + (load.w2 - load.w1) * x2_rel;
        
        segmentType = 'quadratic';
      }
    });
    
    // Set coefficients based on segment type
    if (hasUVL) {
      // V(x) = V_a - ∫w(x)dx from a to x
      // For UVL: w(x) = w1 + (w2-w1)*(x-load.a)/(load.b-load.a)
      // This gives V(x) = c0 + c1*x + c2*x²
      const slope = (uvlW2 - uvlW1) / (b - a);
      coeffs = [V_a, -uvlW1, -slope/2];
    } else if (hasUDL) {
      // V(x) = V_a + c1*(x-a)
      // where c1 = -w (rate of change)
      coeffs = [V_a, udlRate];
    }
    
    // Calculate V_b using the appropriate formula
    let V_b = V_a;
    if (hasUVL) {
      const dx = b - a;
      V_b = coeffs[0] + coeffs[1] * dx + coeffs[2] * dx * dx;
    } else if (hasUDL) {
      V_b = V_a + udlRate * (b - a);
    }
    
    segments.push({
      a,
      b,
      type: segmentType,
      coeffs,
      V_a,
      V_b
    });
  }
  
  return segments;
}

// Enhanced calculateMomentSegments with proper coefficients
function calculateMomentSegments(
  V_segments: DiagramSegment[],
  loads: Loads,
  reactions: Reaction[],
  events: number[],
  length: number
): DiagramSegment[] {
  const segments: DiagramSegment[] = [];
  
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i];
    const b = events[i + 1];
    const V_segment = V_segments[i];
    
    // Calculate moment at start of segment using moment equilibrium
    let M_a = 0;
    
    // Add moments from reactions
    reactions.forEach(reaction => {
      if (reaction.type === 'vertical' && reaction.x !== undefined && reaction.x < a) {
        M_a += (reaction.R || 0) * (a - reaction.x);
      }
      if (reaction.type === 'moment' && reaction.x !== undefined && reaction.x <= a) {
        M_a += reaction.M || 0;
      }
    });
    
    // Subtract moments from loads
    loads.point.forEach(load => {
      if (load.x < a) {
        M_a -= load.P * (a - load.x);
      }
    });
    
    loads.angled.forEach(load => {
      if (load.x < a) {
        const Py = load.P * Math.sin(load.theta_deg * Math.PI / 180);
        M_a -= Py * (a - load.x);
      }
    });
    
    // For distributed loads before this segment
    loads.udl.forEach(load => {
      if (load.b <= a) {
        // Entire UDL is before point a
        const R = load.w * (load.b - load.a);
        const xR = (load.a + load.b) / 2;
        M_a -= R * (a - xR);
      } else if (load.a < a && load.b > a) {
        // UDL spans across point a
        const L_active = a - load.a;
        const R_active = load.w * L_active;
        M_a -= R_active * L_active / 2;
      }
    });
    
    loads.uvl.forEach(load => {
      if (load.b <= a) {
        // Entire UVL is before point a
        const R = (load.w1 + load.w2) * (load.b - load.a) / 2;
        const L = load.b - load.a;
        const xR = load.a + L * (load.w1 + 2 * load.w2) / (3 * (load.w1 + load.w2));
        M_a -= R * (a - xR);
      } else if (load.a < a && load.b > a) {
        // UVL spans across point a
        const L_active = a - load.a;
        const w_at_a = load.w1 + (load.w2 - load.w1) * L_active / (load.b - load.a);
        const R_active = (load.w1 + w_at_a) * L_active / 2;
        const xR = load.a + L_active * (load.w1 + 2 * w_at_a) / (3 * (load.w1 + w_at_a));
        M_a -= R_active * (a - xR);
      }
    });
    
    loads.moment.forEach(load => {
      if (load.x <= a) {
        M_a += load.M;
      }
    });
    
    // Determine segment type and coefficients based on shear segment
    let segmentType: 'linear' | 'quadratic' | 'cubic' = 'linear';
    let coeffs: number[] = [];
    
    // The moment is the integral of shear
    // If V is constant → M is linear
    // If V is linear → M is quadratic (parabolic)
    // If V is quadratic → M is cubic
    
    if (V_segment.type === 'const') {
      // M(x) = M_a + V*(x-a)
      segmentType = 'linear';
      coeffs = [M_a, V_segment.V_a || 0];
    } else if (V_segment.type === 'linear') {
      // V(x) = V_a + c1*(x-a)
      // M(x) = M_a + V_a*(x-a) + c1*(x-a)²/2
      segmentType = 'quadratic';
      const c1 = V_segment.coeffs?.[1] || 0;
      coeffs = [M_a, V_segment.V_a || 0, c1/2];
    } else if (V_segment.type === 'quadratic') {
      // V(x) = c0 + c1*(x-a) + c2*(x-a)²
      // M(x) = M_a + c0*(x-a) + c1*(x-a)²/2 + c2*(x-a)³/3
      segmentType = 'cubic';
      const c0 = V_segment.coeffs?.[0] || 0;
      const c1 = V_segment.coeffs?.[1] || 0;
      const c2 = V_segment.coeffs?.[2] || 0;
      coeffs = [M_a, c0, c1/2, c2/3];
    }
    
    // Calculate M_b using the coefficients
    let M_b = M_a;
    const dx = b - a;
    
    if (segmentType === 'linear') {
      M_b = coeffs[0] + coeffs[1] * dx;
    } else if (segmentType === 'quadratic') {
      M_b = coeffs[0] + coeffs[1] * dx + coeffs[2] * dx * dx;
    } else if (segmentType === 'cubic') {
      M_b = coeffs[0] + coeffs[1] * dx + coeffs[2] * dx * dx + coeffs[3] * dx * dx * dx;
    }
    
    segments.push({
      a,
      b,
      type: segmentType,
      coeffs,
      M_a,
      M_b
    });
  }
  
  return segments;
}

function calculateMomentAtPoint(x: number, loads: Loads, reactions: Reaction[]): number {
  let moment = 0;
  
  // Add moment from reactions (clockwise positive)
  reactions.forEach(reaction => {
    if (reaction.type === 'vertical' && reaction.x !== undefined && reaction.x < x) {
      moment += (reaction.R || 0) * (x - reaction.x);
    }
  });
  
  // Subtract moment from point loads
  loads.point.forEach(load => {
    if (load.x < x) {
      moment -= load.P * (x - load.x);
    }
  });
  
  // Subtract moment from angled loads
  loads.angled.forEach(load => {
    if (load.x < x) {
      const Py = load.P * Math.sin(load.theta_deg * Math.PI / 180);
      moment -= Py * (x - load.x);
    }
  });
  
  // Subtract moment from distributed loads
  loads.udl.forEach(load => {
    // Check if UDL is to the left of the current point
    if (load.b < x) {
      // Entire UDL is to the left. Calculate resultant force and moment arm from x.
      const R = load.w * (load.b - load.a);
      const xR = (load.a + load.b) / 2;
      moment -= R * (x - xR);
    } else if (load.a < x) {
      // UDL spans across the current point x.
      const L_active = x - load.a;
      const R_active = load.w * L_active;
      const xR_active = L_active / 2;
      moment -= R_active * (x - (load.a + xR_active));
    }
  });
  
  loads.uvl.forEach(load => {
    // Check if UVL is to the left of the current point
    if (load.b < x) {
      // Entire UVL is to the left. Calculate resultant force and moment arm from x.
      const R = (load.w1 + load.w2) * (load.b - load.a) / 2;
      const xR = load.a + (load.w1 + 2 * load.w2) / (3 * (load.w1 + load.w2)) * (load.b - load.a);
      moment -= R * (x - xR);
    } else if (load.a < x) {
      // UVL spans across the current point x.
      const L_active = x - load.a;
      const w1_at_x = load.w1 + (load.w2 - load.w1) * L_active / (load.b - load.a);
      const R_active = (load.w1 + w1_at_x) * L_active / 2;
      const xR_active = load.a + (load.w1 + 2 * w1_at_x) / (3 * (load.w1 + w1_at_x)) * L_active;
      moment -= R_active * (x - xR_active);
    }
  });
  
  // Add applied moments
  loads.moment.forEach(load => {
    if (load.x < x) {
      moment += load.M;
    }
  });
  
  return moment;
}

function findExtrema(V_segments: DiagramSegment[], M_segments: DiagramSegment[], loads: Loads, reactions: Reaction[], length: number) {
  let Vmax = -Infinity, Vmin = Infinity, Mmax = -Infinity, Mmin = Infinity;
  let Vmax_pos = 0, Vmin_pos = 0, Mmax_pos = 0, Mmin_pos = 0;
  
  // Check segment endpoints
  V_segments.forEach((segment) => {
    if (segment.V_a! > Vmax) {
      Vmax = segment.V_a!;
      Vmax_pos = segment.a;
    }
    if (segment.V_a! < Vmin) {
      Vmin = segment.V_a!;
      Vmin_pos = segment.a;
    }
    if (segment.V_b! > Vmax) {
      Vmax = segment.V_b!;
      Vmax_pos = segment.b;
    }
    if (segment.V_b! < Vmin) {
      Vmin = segment.V_b!;
      Vmin_pos = segment.b;
    }
  });
  
  M_segments.forEach((segment) => {
    if (segment.M_a! > Mmax) {
      Mmax = segment.M_a!;
      Mmax_pos = segment.a;
    }
    if (segment.M_a! < Mmin) {
      Mmin = segment.M_a!;
      Mmin_pos = segment.a;
    }
    if (segment.M_b! > Mmax) {
      Mmax = segment.M_b!;
      Mmax_pos = segment.b;
    }
    if (segment.M_b! < Mmin) {
      Mmin = segment.M_b!;
      Mmin_pos = segment.b;
    }
  });
  
  // Check for extrema within segments (especially for distributed loads)
  V_segments.forEach((segment) => {
    // Check for zero shear point within linear segments (UDL)
    if (segment.type === 'linear' && segment.V_a! * segment.V_b! < 0) {
      // Shear changes sign, so there's a zero point within this segment
      const slope = (segment.V_b! - segment.V_a!) / (segment.b - segment.a);
      const zeroShearX = segment.a - segment.V_a! / slope;
      
      // Calculate moment at this zero shear point
      const momentAtZeroShear = calculateMomentAtPoint(zeroShearX, loads, reactions);
      
      if (momentAtZeroShear > Mmax) {
        Mmax = momentAtZeroShear;
        Mmax_pos = zeroShearX;
      }
      if (momentAtZeroShear < Mmin) {
        Mmin = momentAtZeroShear;
        Mmin_pos = zeroShearX;
      }
    }
    
    // Check for extrema within quadratic segments (UVL)
    if (segment.type === 'quadratic') {
      // For UVL, check at the midpoint of the segment as a potential extremum
      const midPoint = (segment.a + segment.b) / 2;
      const momentAtMid = calculateMomentAtPoint(midPoint, loads, reactions);
      
      if (momentAtMid > Mmax) {
        Mmax = momentAtMid;
        Mmax_pos = midPoint;
      }
      if (momentAtMid < Mmin) {
        Mmin = momentAtMid;
        Mmin_pos = midPoint;
      }
    }
  });
  
  return {
    Vmax,
    Vmin,
    Mmax,
    Mmin,
    positions: {
      Vmax_pos,
      Vmin_pos,
      Mmax_pos,
      Mmin_pos
    }
  };
}

function convertReactionsToDisplayUnits(reactions: Reaction[], units: { length: string; force: string }): Reaction[] {
  return reactions.map(reaction => ({
    ...reaction,
    x: reaction.x !== undefined ? convertLength(reaction.x, BASE_UNITS.length, units.length) : undefined,
    R: reaction.R !== undefined ? convertForce(reaction.R, BASE_UNITS.force, units.force) : undefined,
    M: reaction.M !== undefined ? convertForce(reaction.M, BASE_UNITS.force, units.force) * convertLength(1, BASE_UNITS.length, units.length) : undefined,
    H: reaction.H !== undefined ? convertForce(reaction.H, BASE_UNITS.force, units.force) : undefined
  }));
}

function convertSegmentsToDisplayUnits(segments: DiagramSegment[], units: { length: string; force: string }): DiagramSegment[] {
  return segments.map(segment => ({
    ...segment,
    a: convertLength(segment.a, BASE_UNITS.length, units.length),
    b: convertLength(segment.b, BASE_UNITS.length, units.length),
    V_a: segment.V_a !== undefined ? convertForce(segment.V_a, BASE_UNITS.force, units.force) : undefined,
    V_b: segment.V_b !== undefined ? convertForce(segment.V_b, BASE_UNITS.force, units.force) : undefined,
    M_a: segment.M_a !== undefined ? convertForce(segment.M_a, BASE_UNITS.force, units.force) * convertLength(1, BASE_UNITS.length, units.length) : undefined,
    M_b: segment.M_b !== undefined ? convertForce(segment.M_b, BASE_UNITS.force, units.force) * convertLength(1, BASE_UNITS.length, units.length) : undefined
  }));
}

function convertExtremaToDisplayUnits(extrema: {
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
}, units: { length: string; force: string }) {
  return {
    Vmax: convertForce(extrema.Vmax, BASE_UNITS.force, units.force),
    Vmin: convertForce(extrema.Vmin, BASE_UNITS.force, units.force),
    Mmax: convertForce(extrema.Mmax, BASE_UNITS.force, units.force) * convertLength(1, BASE_UNITS.length, units.length),
    Mmin: convertForce(extrema.Mmin, BASE_UNITS.force, units.force) * convertLength(1, BASE_UNITS.length, units.length),
    positions: {
      Vmax_pos: convertLength(extrema.positions.Vmax_pos, BASE_UNITS.length, units.length),
      Vmin_pos: convertLength(extrema.positions.Vmin_pos, BASE_UNITS.length, units.length),
      Mmax_pos: convertLength(extrema.positions.Mmax_pos, BASE_UNITS.length, units.length),
      Mmin_pos: convertLength(extrema.positions.Mmin_pos, BASE_UNITS.length, units.length)
    }
  };
}

function createErrorResult(error: string): AnalysisResult {
  return {
    reactions: [],
    events: [],
    V_segments: [],
    M_segments: [],
    extrema: {
      Vmax: 0,
      Vmin: 0,
      Mmax: 0,
      Mmin: 0,
      positions: {
        Vmax_pos: 0,
        Vmin_pos: 0,
        Mmax_pos: 0,
        Mmin_pos: 0
      }
    },
    isValid: false,
    error
  };
}

// Legacy function for backward compatibility
export function calculateBeamAnalysisLegacy(
  beamData: { length: number; units: string },
  supports: { type: string; positions: number[] }[],
  loads: { id: string; position: number; magnitude: number }[]
): {
  reactions: { [key: string]: number };
  shearForce: { x: number[]; y: number[] };
  bendingMoment: { x: number[]; y: number[] };
  maxShear: { position: number; value: number };
  maxMoment: { position: number; value: number };
  isValid: boolean;
  error?: string;
} {
  // Convert legacy format to new format and call new function
  const newBeamData = {
    length: beamData.length,
    units: { length: 'm', force: 'kN' } // Default units
  };
  
  const newSupports: Support = {
    type: supports[0].type === 'Pin + Roller' ? 'pin+roller' : 'fixed',
    pin_x: supports[0].positions[0],
    roller_x: supports[0].positions[1],
    fixed_pos: supports[0].positions[0] === 0 ? 'left' : 'right'
  };
  
  const newLoads: Loads = {
    point: loads.map((load: { id: string; position: number; magnitude: number }) => ({
      label: load.id,
      x: load.position,
      P: load.magnitude
    })),
    angled: [],
    udl: [],
    uvl: [],
    moment: []
  };
  
  const result = calculateBeamAnalysis(newBeamData, newSupports, newLoads);
  
  // Convert back to legacy format
  return {
    reactions: result.reactions.reduce((acc: { [key: string]: number }, r: Reaction) => {
      if (r.type === 'vertical') {
        acc[r.at] = r.R || 0;
      }
      return acc;
    }, {}),
    shearForce: { x: result.events, y: result.V_segments.map(s => s.V_a || 0) },
    bendingMoment: { x: result.events, y: result.M_segments.map(s => s.M_a || 0) },
    maxShear: { position: result.extrema.positions.Vmax_pos, value: result.extrema.Vmax },
    maxMoment: { position: result.extrema.positions.Mmax_pos, value: result.extrema.Mmax },
    isValid: result.isValid,
    error: result.error
  };
}

// Updated ShearForceDiagram data generation
export function generateShearForceData(analysisResult: AnalysisResult) {
  const dataPoints: Array<{ x: number; shearForce: number }> = [];
  
  analysisResult.V_segments.forEach((segment) => {
    const segmentLength = segment.b - segment.a;
    
    // Determine number of points based on segment type
    let numPoints = 2; // Default for constant segments
    if (segment.type === 'linear') numPoints = 10;
    if (segment.type === 'quadratic') numPoints = 20;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = segment.a + segmentLength * t;
      const dx = x - segment.a;
      let shearForce = 0;
      
      // Calculate shear using coefficients
      if (segment.coeffs) {
        switch (segment.type) {
          case 'const':
            shearForce = segment.coeffs[0];
            break;
          case 'linear':
            // V(x) = c0 + c1*dx
            shearForce = segment.coeffs[0] + (segment.coeffs[1] || 0) * dx;
            break;
          case 'quadratic':
            // V(x) = c0 + c1*dx + c2*dx²
            shearForce = segment.coeffs[0] + 
                        (segment.coeffs[1] || 0) * dx + 
                        (segment.coeffs[2] || 0) * dx * dx;
            break;
        }
      } else {
        // Fallback to linear interpolation
        shearForce = segment.V_a! + (segment.V_b! - segment.V_a!) * t;
      }
      
      dataPoints.push({
        x: Math.round(x * 1000) / 1000,
        shearForce: Math.round(shearForce * 1000) / 1000
      });
    }
  });
  
  // Remove duplicates
  const uniquePoints = dataPoints.filter((point, index, arr) => 
    index === 0 || Math.abs(point.x - arr[index - 1].x) > 0.001
  );
  
  return uniquePoints;
}

// Updated BendingMomentDiagram data generation  
export function generateBendingMomentData(analysisResult: AnalysisResult) {
  const dataPoints: Array<{ x: number; bendingMoment: number }> = [];
  
  analysisResult.M_segments.forEach((segment) => {
    const segmentLength = segment.b - segment.a;
    
    // Determine number of points based on segment type
    let numPoints = 10; // Default for linear segments
    if (segment.type === 'quadratic') numPoints = 20;
    if (segment.type === 'cubic') numPoints = 30;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = segment.a + segmentLength * t;
      const dx = x - segment.a;
      let bendingMoment = 0;
      
      // Calculate moment using coefficients
      if (segment.coeffs) {
        switch (segment.type) {
          case 'linear':
            // M(x) = c0 + c1*dx
            bendingMoment = segment.coeffs[0] + (segment.coeffs[1] || 0) * dx;
            break;
          case 'quadratic':
            // M(x) = c0 + c1*dx + c2*dx²
            bendingMoment = segment.coeffs[0] + 
                           (segment.coeffs[1] || 0) * dx + 
                           (segment.coeffs[2] || 0) * dx * dx;
            break;
          case 'cubic':
            // M(x) = c0 + c1*dx + c2*dx² + c3*dx³
            bendingMoment = segment.coeffs[0] + 
                           (segment.coeffs[1] || 0) * dx + 
                           (segment.coeffs[2] || 0) * dx * dx + 
                           (segment.coeffs[3] || 0) * dx * dx * dx;
            break;
        }
      } else {
        // Fallback to linear interpolation
        bendingMoment = segment.M_a! + (segment.M_b! - segment.M_a!) * t;
      }
      
      dataPoints.push({
        x: Math.round(x * 1000) / 1000,
        bendingMoment: Math.round(bendingMoment * 1000) / 1000
      });
    }
  });
  
  // Remove duplicates
  const uniquePoints = dataPoints.filter((point, index, arr) => 
    index === 0 || Math.abs(point.x - arr[index - 1].x) > 0.001
  );
  
  return uniquePoints;
}
