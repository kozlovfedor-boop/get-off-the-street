# Feature Brainstorming: "Get off the Street" RPG

## Current State Analysis

Your game currently has:
- **4 core stats**: Money, Health, Hunger, Day
- **9 actions**: Work, Sleep, Panhandle, Find Food, Eat, Steal, Buy Food, Travel
- **4 locations**: Shelter, Park, Camden Town, London City
- **12 events**: Positive (find money, generous stranger, bonus tip, free resource), Negative (robbery, sickness, weather, police), Action-specific (work accident, nightmare)
- **Event system**: Interactive modal-based choices with consequences
- **Time system**: 24-hour clock with time-gated actions
- **Character animations**: 8-frame sprite with walking animations
- **Well-architected**: Preset-based config, class inheritance, factory patterns

---

## POTENTIAL NEW FEATURES (Categorized)

### CATEGORY 1: PROGRESSION SYSTEMS

#### 1.1 **Level/XP System**
- Gain XP from actions (work, panhandle, steal)
- Level up unlocks better action variants or perks
- Higher levels = better pay, reduced risks, faster actions
- **Complexity**: Medium
- **Impact**: High (adds long-term progression goal)
- **Fits architecture**: Add `experience` and `level` to Player class

#### 1.2 **Skill Trees**
- Multiple skills: Begging, Thieving, Labor, Survival, Social
- Each skill improves specific action outcomes
- Train skills through practice or special training actions
- **Complexity**: High
- **Impact**: Very High (major gameplay depth)
- **Fits architecture**: New SkillManager class, skill-based action modifiers

#### 1.3 **Achievement/Badge System**
- Unlock badges for milestones (survive 7 days, earn £500, etc.)
- Achievements provide small bonuses or unlock content
- **Complexity**: Low-Medium
- **Impact**: Medium (replay value, player engagement)
- **Fits architecture**: New AchievementManager class

#### 1.4 **Reputation System**
- Track reputation with different groups: Police, Locals, Shelter Staff, Business Owners
- Actions affect reputation (stealing lowers police rep, working raises business rep)
- Reputation gates access to actions, locations, or events
- **Complexity**: Medium-High
- **Impact**: High (adds social dynamics)
- **Fits architecture**: New ReputationManager class, event/action integration

---

### CATEGORY 2: INVENTORY & ITEMS

#### 2.1 **Basic Inventory System**
- Carry items: Food, Medicine, Warm Clothes, Tools, Stolen Goods
- Limited slots (backpack capacity)
- Use items to restore health/hunger or enable actions
- **Complexity**: Medium
- **Impact**: High (adds resource management layer)
- **Fits architecture**: New InventoryManager class, item-based actions

#### 2.2 **Equipment/Clothing System**
- Equip items: Jacket (warmth), Shoes (faster travel), Hat (better panhandling)
- Items degrade over time, need repair or replacement
- **Complexity**: Medium-High
- **Impact**: Medium (visual progression, stat bonuses)
- **Fits architecture**: Equipment slots in Player, condition tracking

#### 2.3 **Trading/Bartering System**
- Trade items with NPCs or other homeless people
- Sell stolen goods to fences
- Buy items from stores or black market
- **Complexity**: Medium
- **Impact**: Medium (economic gameplay depth)
- **Fits architecture**: New TradeAction, NPC inventory systems

---

### CATEGORY 3: NPC INTERACTIONS

#### 3.1 **Named NPCs**
- Recurring characters: Shelter Manager, Street Vendor, Police Officer, Fellow Homeless Friend
- Relationship tracking (friendship, trust)
- Dialogue choices affect relationships and unlock opportunities
- **Complexity**: High
- **Impact**: Very High (storytelling, emotional engagement)
- **Fits architecture**: NPC class, DialogueManager, relationship tracking

#### 3.2 **NPC Quest Chains**
- NPCs give missions: "Help me find my lost item," "Work this job for me"
- Quests reward money, items, reputation, or story progression
- Multi-step quests with branching outcomes
- **Complexity**: Very High
- **Impact**: Very High (structured narrative goals)
- **Fits architecture**: QuestManager class, quest state tracking

#### 3.3 **Companion System**
- Recruit a companion (stray dog, fellow homeless person)
- Companion provides bonuses (dog warns of danger, friend shares resources)
- Companion has own needs (feed dog, maintain friendship)
- **Complexity**: High
- **Impact**: Medium-High (emotional attachment, tactical depth)
- **Fits architecture**: Companion class, companion-specific events

---

### CATEGORY 4: SURVIVAL MECHANICS

#### 4.1 **Hygiene/Cleanliness Stat**
- New stat that degrades over time
- Low hygiene = worse panhandling, can't enter some locations, health penalties
- Clean up at shelter, public bathrooms, or pay for gym shower
- **Complexity**: Low-Medium
- **Impact**: Medium (realism, new resource to manage)
- **Fits architecture**: Add hygiene to Player, new CleanAction

#### 4.2 **Mental Health/Morale System**
- Stress, depression, hope as stats
- Affects action success rates, event outcomes, or enables special events
- Improve through positive events, kindness from NPCs, or rest
- **Complexity**: Medium
- **Impact**: High (emotional depth, realistic portrayal)
- **Fits architecture**: New mental health stats, morale-based event triggers

#### 4.3 **Addiction System**
- Option to use drugs/alcohol for temporary stat boosts or stress relief
- Risk of addiction (withdrawal penalties, money drain)
- Recovery through shelter programs or willpower
- **Complexity**: High
- **Impact**: Very High (realistic portrayal, moral choices, risk/reward)
- **Fits architecture**: Addiction stat, withdrawal events, recovery actions

#### 4.4 **Weather/Seasons System**
- Dynamic weather: Rain, Snow, Heat Waves
- Seasons affect available actions, health impacts, earning potential
- Need appropriate clothing/shelter for harsh weather
- **Complexity**: Medium
- **Impact**: Medium (environmental challenge, planning depth)
- **Fits architecture**: WeatherManager class, season-based event filtering

#### 4.5 **Disease/Injury System**
- Specific conditions: Flu, Broken Bone, Infection
- Each condition has different effects and recovery methods
- Untreated conditions worsen over time
- **Complexity**: Medium-High
- **Impact**: Medium (survival challenge, decision pressure)
- **Fits architecture**: ConditionManager, condition-specific events

---

### CATEGORY 5: COMBAT & CONFLICT

#### 5.1 **Combat System (Turn-Based)**
- Fight during robbery events or defend yourself
- Stats: Attack, Defense, Health
- Choose actions: Punch, Dodge, Flee, Use Item
- **Complexity**: Very High
- **Impact**: High (action gameplay, risk management)
- **Fits architecture**: CombatManager class, combat events

#### 5.2 **Stealth/Evasion Mechanics**
- Sneak during steal action for better success rate
- Evade police during chase events
- Stealth skill improves over time
- **Complexity**: Medium
- **Impact**: Medium (tactical depth for risky actions)
- **Fits architecture**: Stealth modifiers in StealAction, chase events

---

### CATEGORY 6: LOCATIONS & WORLD

#### 6.1 **More Locations**
- Library (free warmth, read to improve skills, rest)
- Hospital (expensive healthcare, emergency room)
- Soup Kitchen (free meals at specific times)
- Train Station (travel hub, panhandling opportunities)
- Beach/Riverside (seasonal work, fishing for food)
- Abandoned Building (free sleep but dangerous)
- **Complexity**: Low-Medium per location
- **Impact**: High (world variety, strategic choices)
- **Fits architecture**: Create new Location classes

#### 6.2 **Dynamic Location Events**
- Locations change based on time of day or day of week
- Events: Street Festival (better panhandling), Police Raid (avoid shelter), Market Day (cheap food)
- **Complexity**: Medium
- **Impact**: Medium (world feels alive, planning depth)
- **Fits architecture**: Date-based event filtering, special location states

#### 6.3 **Safe Zones & Danger Zones**
- Certain locations safer/riskier at different times
- Risk affects event probabilities and police encounters
- **Complexity**: Low
- **Impact**: Low-Medium (already partially implemented via robbery events)
- **Fits architecture**: Risk levels already in location/event system

---

### CATEGORY 7: ECONOMY & RESOURCES

#### 7.1 **Job Market Fluctuations**
- Work pay varies by day/season (construction boom, holiday hiring)
- Unemployment spikes reduce pay or availability
- **Complexity**: Medium
- **Impact**: Medium (economic realism, planning)
- **Fits architecture**: Dynamic pay modifiers in WorkAction

#### 7.2 **Price Inflation/Deflation**
- Food prices change over time
- Rent goal increases if you take too long
- **Complexity**: Low-Medium
- **Impact**: Medium (time pressure, economic challenge)
- **Fits architecture**: Dynamic config values, time-based modifiers

#### 7.3 **Benefits/Welfare System**
- Apply for government assistance (long process, bureaucracy)
- Receive small weekly payments if approved
- Risk losing benefits if caught stealing
- **Complexity**: High
- **Impact**: Medium (realistic portrayal, strategic choice)
- **Fits architecture**: New BureaucracyManager, weekly payment events

---

### CATEGORY 8: WIN CONDITIONS & ENDINGS

#### 8.1 **Multiple Endings**
- Different outcomes based on choices:
  - "Success": Rent apartment (current goal)
  - "Community": Stay homeless but build strong relationships
  - "Escape": Leave city for new life elsewhere
  - "Tragedy": Give up hope, dark ending
- **Complexity**: Medium
- **Impact**: Very High (replay value, narrative depth)
- **Fits architecture**: Ending flags based on stats/choices, multiple victory checks

#### 8.2 **Post-Game Content**
- After getting apartment, continue playing with new challenges
- Pay rent monthly, maintain job, avoid eviction
- New goal: Save £10,000 for house down payment
- **Complexity**: Medium-High
- **Impact**: High (extended gameplay, long-term engagement)
- **Fits architecture**: Phase 2 game mode, new actions/events

---

### CATEGORY 9: META FEATURES

#### 9.1 **Save/Load System**
- Save progress to localStorage
- Multiple save slots
- Auto-save feature
- **Complexity**: Medium
- **Impact**: Very High (essential for longer gameplay sessions)
- **Fits architecture**: Serialize Player/Game state to JSON

#### 9.2 **Difficulty Modes**
- Easy: Higher pay, slower hunger, cheaper rent
- Normal: Current balance
- Hard: Lower pay, faster degradation, random setbacks
- Hardcore: Permadeath, no saves
- **Complexity**: Low-Medium
- **Impact**: High (accessibility, replay value)
- **Fits architecture**: Difficulty modifiers in CONFIG

#### 9.3 **New Game+**
- Restart with carried-over skills or items
- Harder challenges, higher rent goal
- **Complexity**: Medium
- **Impact**: Medium (replay incentive)
- **Fits architecture**: Persistent progression flags

#### 9.4 **Statistics Tracking**
- Track total money earned, days survived, actions taken
- Display at game end
- Leaderboards (if multiplayer ever considered)
- **Complexity**: Low
- **Impact**: Low-Medium (player satisfaction)
- **Fits architecture**: StatisticsManager class

---

### CATEGORY 10: NARRATIVE & STORY

#### 10.1 **Backstory System**
- Choose background at start: Veteran, Addict, Evicted, Runaway
- Backstory affects starting stats, available actions, or NPC reactions
- **Complexity**: Medium
- **Impact**: High (character depth, roleplay)
- **Fits architecture**: Character creation flow, backstory flags

#### 10.2 **Story Events/Cutscenes**
- Scripted events at certain milestones (Day 10, £1000 saved, etc.)
- Story reveals character's past or future hopes
- **Complexity**: Medium-High
- **Impact**: High (emotional engagement, narrative)
- **Fits architecture**: Milestone-based event triggers

#### 10.3 **Moral Choices**
- Events with ethical dilemmas: Help someone vs. Self-preservation
- Choices affect reputation, stats, or story outcomes
- **Complexity**: Medium
- **Impact**: Very High (player agency, replayability)
- **Fits architecture**: Choice-based events (already implemented in v2.4.0)

---

### CATEGORY 11: UI/UX ENHANCEMENTS

#### 11.1 **Tutorial/Onboarding**
- First-time player guide explaining stats, actions, goals
- Tooltips for complex mechanics
- **Complexity**: Low-Medium
- **Impact**: High (new player experience)
- **Fits architecture**: TutorialManager, step-by-step guide

#### 11.2 **Action Previews/Tooltips**
- Hover over action buttons to see expected outcomes
- Show risk levels, time costs, stat changes before committing
- **Complexity**: Low (already partially exists via getPreview())
- **Impact**: Medium (informed decisions, QoL)
- **Fits architecture**: Enhanced UI tooltips

#### 11.3 **Journal/Diary System**
- Record significant events, goals, or thoughts
- Review past decisions and outcomes
- **Complexity**: Medium
- **Impact**: Low-Medium (immersion, reflection)
- **Fits architecture**: JournalManager, log persistence

#### 11.4 **Map/Navigation UI**
- Visual map showing locations and travel times
- Click locations to travel instead of button list
- **Complexity**: Medium
- **Impact**: Medium (visual clarity, UX improvement)
- **Fits architecture**: Enhanced travel UI

---

### CATEGORY 12: AUDIO & POLISH

#### 12.1 **Sound Effects**
- Action sounds (coins clinking, sleeping Z's, walking footsteps)
- Ambient sounds per location (city traffic, park birds)
- **Complexity**: Low-Medium
- **Impact**: Medium (immersion, polish)
- **Fits architecture**: AudioManager class

#### 12.2 **Music System**
- Background music that changes by location or situation
- Tension music during risky actions
- **Complexity**: Low-Medium
- **Impact**: Medium (atmosphere, emotional tone)
- **Fits architecture**: MusicManager, dynamic track switching

#### 12.3 **Particle Effects**
- Visual effects: Money particles when earning, rain/snow weather effects
- Damage indicators, health recovery sparkles
- **Complexity**: Medium
- **Impact**: Low-Medium (visual polish)
- **Fits architecture**: Canvas overlays or CSS animations

---

## RECOMMENDED PRIORITY TIERS

### **TIER S (Highest Impact, Best Fit)**
1. **Save/Load System** - Essential for longer sessions
2. **Inventory System** - Natural progression, high depth
3. **Level/XP System** - Clear progression goal beyond money
4. **Named NPCs** - Emotional engagement, storytelling
5. **Multiple Endings** - Replayability, narrative payoff

### **TIER A (High Impact, Good Fit)**
6. **Hygiene Stat** - Realistic, manageable complexity
7. **More Locations** - World expansion, variety
8. **Skill Trees** - Deep progression (requires careful balance)
9. **Reputation System** - Social dynamics, gates content
10. **Tutorial System** - Onboarding, accessibility

### **TIER B (Medium Impact, Moderate Complexity)**
11. **Mental Health/Morale** - Thematic depth
12. **Weather/Seasons** - Environmental challenge
13. **Quest System** - Structured goals (requires NPCs first)
14. **Backstory System** - Character creation depth
15. **Difficulty Modes** - Accessibility, replay value

### **TIER C (Good Ideas, Higher Complexity or Lower Priority)**
16. **Addiction System** - Sensitive topic, complex mechanics
17. **Combat System** - Major scope increase, different genre feel
18. **Trading/Bartering** - Requires inventory + NPCs first
19. **Disease/Injury** - Granular survival (may be too complex)
20. **Post-Game Content** - Extends playability (implement after core loop solid)

---

## NEXT STEP: USER DECISION

Which category or specific feature interests you most? We can dive deep into planning any of these systems!
