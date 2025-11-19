# Get off the Street

A turn-based survival RPG where you play as a homeless person trying to earn enough money to rent an apartment and escape life on the streets.

## How to Play

1. Open `index.html` in any web browser
2. No installation or dependencies required!

## Game Overview

**Goal:** Save £2,000 while maintaining your health to rent an apartment and win the game.

**Lose Condition:** Your health reaches 0.

**Start:** You begin at City Park at 6:00 AM on Day 1 with no money.

## Stats

- **Money**: Your savings. Need £2,000 to win.
- **Health**: If this reaches 0, you die. Can be restored by resting/sleeping.
- **Hunger**: Decreases with most actions. If it drops below 20, you start losing health.
- **Day**: Tracks how many days you've survived.
- **Time**: 24-hour clock (00:00-23:59). Actions consume time.

## Locations

The game features 4 different locations, each with unique opportunities and risks:

### London City (Rich Business District)
- **Work**: High pay (£30-60), available 8:00 AM - 6:00 PM
- **Police Risk**: Very high (30% when stealing)
- **Panhandling**: Best earnings (£15-35)
- **Travel Time**: 1 hour from Park, 0.5 hour from Shelter

### Camden Town (Industrial Area)
- **Work**: Medium pay (£20-40), available 6:00 AM - 10:00 PM
- **Police Risk**: Moderate (15% when stealing)
- **Panhandling**: Standard earnings (£5-20)
- **Travel Time**: 0.5 hour from Park, 1 hour from London City

### Homeless Shelter
- **Open Hours**: 6:00 PM - 8:00 AM (nighttime only)
- **Sleep**: Safe, effective rest (30-50 health, no robbery risk)
- **Free Meals**: 6:00-8:00 PM (dinner), 6:00-8:00 AM (breakfast) - restores 40-60 hunger
- **Note**: 20% chance of being turned away if you arrive after 10:00 PM
- **Travel Time**: 0.5 hour from anywhere

### City Park (Starting Location)
- **Open**: 24/7
- **Sleep**: Risky (20-35 health, 25% robbery chance at night, 5% during day)
- **Find Food**: Dumpster diving (20-45 hunger)
- **Panhandling**: Available (£5-20)
- **Travel Time**: 1 hour to London City, 0.5 hour to Camden/Shelter

## Actions

Actions consume different amounts of time and affect your stats:

### Find Work (7 hours)
- Available at London City and Camden Town during work hours
- Pay varies by location
- Costs hunger (10-25)
- Safe, steady income

### Sleep/Rest (7 hours for sleep, 2 hours for brief rest)
- **At Shelter**: Best option - safe, restores 30-50 health
- **At Park**: Risky - restores 20-35 health, risk of robbery
- **On Streets**: Brief rest only - restores 10-20 health
- Always costs hunger (5-20)

### Panhandle (2.5 hours)
- Beg for money
- Earnings vary by location (best in London City)
- Costs hunger (5-10)

### Find Food (1.5 hours)
- Search dumpsters at the park
- Restores 20-45 hunger
- Free alternative to shelter meals

### Eat Meal (0.5 hours)
- Only at shelter during meal times
- Restores 40-60 hunger
- Free and most effective

### Steal (1 hour)
- **High Risk**: Police encounter chance varies by location
- **London City**: 30% police risk, caught = -25 health + fine
- **Camden Town**: 15% police risk
- If not caught: 70% success for £50-100, or get beaten (-15 health)
- Costs hunger (5-15)

### Travel (0.5-1 hour)
- Move between locations
- Travel time varies by distance
- Costs small amount of hunger (3-8)

## Random Events

Random events occur based on location and time (20% chance per action):

- **Find Money**: More likely in busy areas (+£5-20)
- **Get Robbed**: Only at park during night (lose £10-40)
- **Get Sick**: Can happen anywhere except shelter (-15 health)
- **Receive Food**: More likely in London City during day (+30 hunger)

## Strategy Tips

### Time Management
- Plan your day around shelter hours (6pm-8am)
- Get to shelter before 10pm to avoid being turned away
- Take advantage of free meals at 6-8pm and 6-8am

### Location Strategy
- **Early Game**: Work at Camden Town (longer hours, safer)
- **Mid Game**: Move to London City for better pay
- **Always**: Sleep at shelter when possible for safety

### Survival
- Keep hunger above 20 to avoid health loss
- Balance work, food, and rest
- Use park only as last resort for sleeping

### Money Making
- Legitimate path: Work + panhandling = slow but safe
- Risky path: Stealing in Camden (lower police risk) = faster but dangerous
- Mixed approach: Work by day, strategic stealing = balanced

### Winning Strategy
- You can win in 30-50 days with smart planning
- Keep health above 20 when approaching £2,000
- Use shelter consistently for free meals and safe sleep

## Development

Built with vanilla HTML, CSS, and JavaScript. No build process or dependencies required.

**Architecture:**
- Modular class-based design
- `TimeManager`: 24-hour clock and time progression
- `LocationManager`: Location definitions and travel
- `EventManager`: Random events with location/time awareness
- `ActionManager`: All player actions
- `UIManager`: DOM manipulation and rendering
- `Game`: Main controller

**File Structure:**
```
/street
├── index.html          # Main game page
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── config.js       # Game constants
│   ├── player.js       # Player state
│   ├── time.js         # Time management
│   ├── locations.js    # Location system
│   ├── events.js       # Random events
│   ├── actions.js      # Player actions
│   ├── ui.js           # UI management
│   └── game.js         # Main controller
└── README.md
```

## Future Expansion Ideas

- NPC relationships and reputation system
- Inventory system
- Different job types with progression
- More complex crime mechanics (fences, drug dealing)
- Weather and seasonal effects
- Save/load functionality
- Sound effects and music
- More locations (job centers, hospitals, police stations)
- Skill/attribute progression system

---

**Current Version:** 2.0.0

**Changelog:**
- **v2.0.0**: Added locations and time of day system
- **v1.0.0**: Initial MVP release
