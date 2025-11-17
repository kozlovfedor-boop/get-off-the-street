# Get off the Street

A turn-based survival RPG where you play as a homeless person trying to earn enough money to rent an apartment and escape life on the streets.

## How to Play

1. Open `index.html` in any web browser
2. No installation or dependencies required!

## Game Overview

**Goal:** Save $2,000 while maintaining your health to rent an apartment and win the game.

**Lose Condition:** Your health reaches 0.

## Stats

- **Money**: Your savings. Need $2,000 to win.
- **Health**: If this reaches 0, you die. Can be restored by resting.
- **Hunger**: Decreases with most actions. If it drops below 20, you start losing health each turn.
- **Day**: Tracks how many days you've survived.

## Actions

Each action advances time by one day.

### Find Work
- Earn $20-50
- Costs hunger (10-25)
- Safe, steady income

### Find Food
- Restore hunger (+20-45)
- No cost
- Essential for survival

### Rest
- Restore health (+10-20)
- Costs hunger (5-13)
- Use when health is low

### Steal
- **Risky!** 50% chance of success
- Success: Gain $50-100
- Failure: Lose 20 health (you get beaten up)
- Costs hunger (5-15)
- High risk, high reward

## Random Events

Each turn, random events may occur:

- Find spare change (+$5-20)
- Get robbed (lose $10-40)
- Catch a cold (-15 health)
- Receive food from a stranger (+30 hunger)
- Nothing happens

## Strategy Tips

- Watch your hunger! Starvation causes health loss
- Balance risk and reward - stealing is tempting but dangerous
- You can win in 40-60 days with good decisions
- Keep health above 20 when approaching $2,000 to ensure victory

## Development

This is a simple MVP built with vanilla HTML, CSS, and JavaScript. No build process or dependencies required.

**Files:**
- `index.html` - Game interface
- `game.js` - Game logic
- `README.md` - This file

## Future Expansion Ideas

- Multiple locations (shelters, job centers, etc.)
- NPC relationships and reputation system
- Inventory system
- Different job types with progression
- More complex crime mechanics
- Drug/addiction system
- Save/load functionality
- Sound effects and music

---

**Version:** 1.0.0 (MVP)
