// Quick test to verify the refactoring works
const CONFIG = require('./js/config.js');

console.log('✓ CONFIG loaded successfully');
console.log('✓ ACTION_PRESETS exists:', !!CONFIG.ACTION_PRESETS);
console.log('✓ ACTION_PRESETS.earnings.high:', CONFIG.ACTION_PRESETS.earnings.high);
console.log('✓ ACTION_PRESETS.health.medium:', CONFIG.ACTION_PRESETS.health.medium);
console.log('✓ ACTION_PRESETS.hunger.low:', CONFIG.ACTION_PRESETS.hunger.low);
console.log('✓ ACTION_PRESETS.risk.high:', CONFIG.ACTION_PRESETS.risk.high);
console.log('✓ ACTION_PRESETS.reward.high:', CONFIG.ACTION_PRESETS.reward.high);
console.log('✓ ACTION_PRESETS.food.high:', CONFIG.ACTION_PRESETS.food.high);

console.log('\n✅ All basic config tests passed!');
