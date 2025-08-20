// Work backwards from expected results to find the correct beam configuration
console.log('=== Finding Beam Configuration for Expected Results ===');

// Expected results
const expectedPinReaction = 24.667; // kN (upward)
const expectedRollerReaction = 35.333; // kN (upward)
const expectedMaxMoment = 353.333; // kN-m
const expectedMinMoment = 0; // kN-m
const expectedMaxShear = 24.667; // kN
const expectedMinShear = -35.333; // kN

console.log('Expected results:');
console.log('Pin reaction:', expectedPinReaction, 'kN');
console.log('Roller reaction:', expectedRollerReaction, 'kN');
console.log('Max moment:', expectedMaxMoment, 'kN-m');
console.log('Min moment:', expectedMinMoment, 'kN-m');
console.log('Max shear:', expectedMaxShear, 'kN');
console.log('Min shear:', expectedMinShear, 'kN');

// Total upward reactions
const totalReactions = expectedPinReaction + expectedRollerReaction; // 60 kN
console.log('\nTotal upward reactions:', totalReactions, 'kN');

// For equilibrium, total downward loads must equal total upward reactions
console.log('Therefore, total downward loads must be:', totalReactions, 'kN');

// The expected results suggest a different load configuration
// Let's try to find what loads would produce a maximum moment of 353.333 kN-m

console.log('\n=== Trying Different Load Configurations ===');

// Configuration 1: Single load at center
console.log('\nConfiguration 1: Single load at center (x=15)');
const P1_center = totalReactions; // 60 kN at x=15
const momentAboutPin_center = P1_center * 15; // 60 * 15 = 900 kN-m
const rollerReaction_center = -momentAboutPin_center / 30; // -900/30 = -30 kN
const pinReaction_center = -P1_center - rollerReaction_center; // -60 - (-30) = -30 kN
const maxMoment_center = pinReaction_center * 15; // -30 * 15 = -450 kN-m

console.log('P1 =', P1_center, 'kN at x=15m');
console.log('Pin reaction:', pinReaction_center, 'kN');
console.log('Roller reaction:', rollerReaction_center, 'kN');
console.log('Max moment:', maxMoment_center, 'kN-m');

// Configuration 2: Two equal loads
console.log('\nConfiguration 2: Two equal loads (30 kN each)');
const P1_equal = 30; // kN at x=10
const P2_equal = 30; // kN at x=20
const momentAboutPin_equal = P1_equal * 10 + P2_equal * 20; // 30*10 + 30*20 = 300 + 600 = 900 kN-m
const rollerReaction_equal = -momentAboutPin_equal / 30; // -900/30 = -30 kN
const pinReaction_equal = -(P1_equal + P2_equal) - rollerReaction_equal; // -60 - (-30) = -30 kN
const maxMoment_equal = pinReaction_equal * 10; // -30 * 10 = -300 kN-m

console.log('P1 =', P1_equal, 'kN at x=10m');
console.log('P2 =', P2_equal, 'kN at x=20m');
console.log('Pin reaction:', pinReaction_equal, 'kN');
console.log('Roller reaction:', rollerReaction_equal, 'kN');
console.log('Max moment:', maxMoment_equal, 'kN-m');

// Configuration 3: Loads that would give positive reactions
console.log('\nConfiguration 3: Upward loads to get positive reactions');
// If we want positive reactions, we need upward loads
const P1_up = -20; // kN at x=10 (upward)
const P2_up = -40; // kN at x=20 (upward)
const momentAboutPin_up = P1_up * 10 + P2_up * 20; // -20*10 + -40*20 = -200 - 800 = -1000 kN-m
const rollerReaction_up = -momentAboutPin_up / 30; // -(-1000)/30 = 33.333 kN
const pinReaction_up = -(P1_up + P2_up) - rollerReaction_up; // -(-60) - 33.333 = 60 - 33.333 = 26.667 kN

console.log('P1 =', P1_up, 'kN at x=10m (upward)');
console.log('P2 =', P2_up, 'kN at x=20m (upward)');
console.log('Pin reaction:', pinReaction_up, 'kN');
console.log('Roller reaction:', rollerReaction_up, 'kN');

// Configuration 4: The actual expected configuration
console.log('\nConfiguration 4: Working backwards from expected reactions');
// If we have positive reactions, the loads must be upward
// Let's assume the loads are at x=6 and x=20
const x1 = 6;
const x2 = 20;
const L = 30;

// We want: R1 = 24.667, R2 = 35.333
// From equilibrium: P1 + P2 = -(R1 + R2) = -60
// From moment equation: R2*L + P1*x1 + P2*x2 = 0
// 35.333*30 + P1*6 + P2*20 = 0
// 1060 + 6*P1 + 20*P2 = 0
// And P1 + P2 = -60

// Solving: P1 = -60 - P2
// 1060 + 6*(-60 - P2) + 20*P2 = 0
// 1060 - 360 - 6*P2 + 20*P2 = 0
// 700 + 14*P2 = 0
// P2 = -700/14 = -50 kN
// P1 = -60 - (-50) = -10 kN

const P1_expected = -10; // kN at x=6 (upward)
const P2_expected = -50; // kN at x=20 (upward)

console.log('P1 =', P1_expected, 'kN at x=6m (upward)');
console.log('P2 =', P2_expected, 'kN at x=20m (upward)');

// Verify this gives the expected reactions
const momentAboutPin_expected = P1_expected * 6 + P2_expected * 20; // -10*6 + -50*20 = -60 - 1000 = -1060 kN-m
const rollerReaction_expected = -momentAboutPin_expected / 30; // -(-1060)/30 = 35.333 kN
const pinReaction_expected = -(P1_expected + P2_expected) - rollerReaction_expected; // -(-60) - 35.333 = 60 - 35.333 = 24.667 kN

console.log('Calculated reactions:');
console.log('Pin reaction:', pinReaction_expected, 'kN');
console.log('Roller reaction:', rollerReaction_expected, 'kN');
console.log('Match expected?', Math.abs(pinReaction_expected - expectedPinReaction) < 0.1 && Math.abs(rollerReaction_expected - expectedRollerReaction) < 0.1 ? 'YES' : 'NO');

console.log('\n=== CONCLUSION ===');
console.log('The expected results are for a beam with UPWARD loads:');
console.log('- P1 = -10 kN at x=6m (upward force)');
console.log('- P2 = -50 kN at x=20m (upward force)');
console.log('This produces the expected positive reactions.');
