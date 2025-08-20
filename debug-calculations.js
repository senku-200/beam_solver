// Debug script to work backwards from expected results
console.log('=== Working Backwards from Expected Results ===');

// Expected reactions
const expectedPinReaction = 24.667; // kN
const expectedRollerReaction = 35.333; // kN

console.log('Expected reactions:');
console.log('Pin reaction (at x=0):', expectedPinReaction, 'kN');
console.log('Roller reaction (at x=30):', expectedRollerReaction, 'kN');

// Total reaction force
const totalReactionForce = expectedPinReaction + expectedRollerReaction; // 60 kN
console.log('Total reaction force:', totalReactionForce, 'kN');

// For equilibrium, total loads must equal total reactions
console.log('Therefore, total downward loads must be:', totalReactionForce, 'kN');

// Expected shear force values
console.log('\nExpected shear force values:');
console.log('Max shear: 24.667 kN (should be at x=0, just after pin)');
console.log('Min shear: -35.333 kN (should be at x=30, just before roller)');

// Expected bending moment values
console.log('\nExpected bending moment values:');
console.log('Max moment: 353.333 kN-m');
console.log('Min moment: 0 kN-m');

// Let's try to determine what loads would produce these results
// If we have a 30m beam with loads at x=6 and x=20
// Let's assume the loads are P1 at x=6 and P2 at x=20

// For the given default configuration: P1=10 kN at x=6, P2=50 kN at x=20
const P1 = 10; // kN at x=6
const P2 = 50; // kN at x=20
const totalLoads = P1 + P2; // 60 kN

console.log('\n=== Testing Default Configuration ===');
console.log('P1 =', P1, 'kN at x=6m');
console.log('P2 =', P2, 'kN at x=20m');
console.log('Total loads:', totalLoads, 'kN');

// Calculate reactions for this configuration
const momentAboutPin = P1 * 6 + P2 * 20; // 10*6 + 50*20 = 60 + 1000 = 1060 kN-m
const rollerReaction = momentAboutPin / 30; // 1060/30 = 35.333 kN
const pinReaction = -totalLoads - rollerReaction; // -60 - 35.333 = -95.333 kN

console.log('Calculated reactions:');
console.log('Pin reaction:', pinReaction, 'kN');
console.log('Roller reaction:', rollerReaction, 'kN');

// Check if this matches expected
console.log('\nComparison:');
console.log('Expected pin reaction:', expectedPinReaction, 'kN');
console.log('Calculated pin reaction:', pinReaction, 'kN');
console.log('Match?', Math.abs(pinReaction - expectedPinReaction) < 0.1 ? 'YES' : 'NO');

console.log('Expected roller reaction:', expectedRollerReaction, 'kN');
console.log('Calculated roller reaction:', rollerReaction, 'kN');
console.log('Match?', Math.abs(rollerReaction - expectedRollerReaction) < 0.1 ? 'YES' : 'NO');

// The issue is clear: the calculated pin reaction is negative but expected is positive
// This suggests the loads might be in the opposite direction (upward instead of downward)

console.log('\n=== Testing with Upward Loads ===');
// Let's try with upward loads (negative values)
const P1_up = -10; // kN at x=6 (upward)
const P2_up = -50; // kN at x=20 (upward)
const totalLoads_up = P1_up + P2_up; // -60 kN

console.log('P1 =', P1_up, 'kN at x=6m (upward)');
console.log('P2 =', P2_up, 'kN at x=20m (upward)');
console.log('Total loads:', totalLoads_up, 'kN');

const momentAboutPin_up = P1_up * 6 + P2_up * 20; // -10*6 + -50*20 = -60 - 1000 = -1060 kN-m
const rollerReaction_up = momentAboutPin_up / 30; // -1060/30 = -35.333 kN
const pinReaction_up = -totalLoads_up - rollerReaction_up; // -(-60) - (-35.333) = 60 + 35.333 = 95.333 kN

console.log('Calculated reactions (upward loads):');
console.log('Pin reaction:', pinReaction_up, 'kN');
console.log('Roller reaction:', rollerReaction_up, 'kN');

// Still not matching. Let me check if the issue is in the sign convention of the calculation
console.log('\n=== The Real Issue ===');
console.log('The problem is likely in the sign convention used in the calculation code.');
console.log('Expected: Pin reaction should be positive (upward)');
console.log('Current: Pin reaction is negative (downward)');
console.log('This suggests the reaction calculation formula is wrong.');

// Let me verify the correct formula
console.log('\n=== Correct Reaction Calculation ===');
console.log('For equilibrium:');
console.log('ΣFy = 0: R1 + R2 + P1 + P2 = 0');
console.log('ΣM_A = 0: R2*L + P1*x1 + P2*x2 = 0');
console.log('Where:');
console.log('- L = beam length = 30m');
console.log('- x1 = 6m, x2 = 20m');
console.log('- P1 = 10 kN, P2 = 50 kN (downward = positive)');

console.log('\nFrom moment equation:');
console.log('R2*30 + 10*6 + 50*20 = 0');
console.log('R2*30 + 60 + 1000 = 0');
console.log('R2*30 = -1060');
console.log('R2 = -1060/30 = -35.333 kN');

console.log('\nFrom force equation:');
console.log('R1 + R2 + 10 + 50 = 0');
console.log('R1 + (-35.333) + 60 = 0');
console.log('R1 = -60 + 35.333 = -24.667 kN');

console.log('\nWait! This gives us the OPPOSITE of what we expect!');
console.log('Expected: R1 = +24.667 kN, R2 = +35.333 kN');
console.log('Calculated: R1 = -24.667 kN, R2 = -35.333 kN');

console.log('\nThis suggests the expected results might be using a different sign convention');
console.log('or the loads in the expected results are different from what we assumed.');
