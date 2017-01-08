# Backlog
## Technical
- High
  - Using keyboard to look at tiles
  - Show enemy resistances in UI
  - UI highlighting
  - nodemon with babel-node?
  - CSRF
- Med
  - Numbered levels from level database
  - Special inventory slot for TheTreasure?
  - Weights for random dungeon rooms
  - Keybindings Overlay
  - Tile Contents Panel (Use + and - to navigate?)
  - Handle legal noPath situations
  - Method for getting a single adjacent tile from a direction
  - Keyboard and mouse instructions
  - Don't bundle jQuery with webpack
  - BlockTheExit strategy
  - Let player know their speed
  - Spell scroll compound sprites
  - Animate death frame (instead of ending). Camera
  - Potion of flying
  - Queue animations
  - Use https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  - In-game advice (don't flee fast enemies, remember abilities, find the treasure)
  - Make ranged enemies avoid getting in melee range
  - Offline-first
  - Rename distance functions
  - Autopath during enemies should go 1 tile at a time
  - See corners when adjacent edges are in range (5/3 slope)
  - Non-default session store
- Low
  - Come up with a better name for "speed"
  - Option to hide enemy health and action bars
  - Animation speed
  - Consider splitting source/target events into two events
  - Icon to indicate an enemy about to take a double-move
  - Optimize webpack (http://jamesknelson.com/using-es6-in-the-browser-with-babel-6-and-webpack/), (https://github.com/babel/babel-loader#babel-loader-is-slow)
  - RandomStrategyStrategy
  - RandomAbilityStrategy
  - Make ClunkyNintiesCellPhone use predefined strategies
  - Circular dependency injection (GameEvents inside Creature)
  - Melee attack animation improvement
  - Color UI when holding accelerator keys (items during ctrl)
  - Typescript
  - Ability to compare 2 dungeons, for testing dungeon factory regressions
  - Use Yarn

## Content
  - Invisibility Spell
  - Teleport Spell
  - Deflection Spell?

## Bugs
  - Monsters on the same initiative collide?
  - Tooltips don't update on state change
  - Enemies try to move when they're snared
  - number hotkeys not working in firefox
  - Autopath only stops if an enemy is visible during the player's turn, and not if an enemy became visible while waiting
  - Door opening animation should be delayed same as creature moving
  - Leap
    - should not let you jump to a solid tile
    - should not let you jump into a pit


## Art
  - Snail icon
  - Rabbit icon
  - Robes
  - Druid
  - Stairs tile
  - Trash can icon
  - Parchment scroll background image for game log
  - Knight
  - Magic sword
  - Troll
  - Mimic
  - Dragon
  - Item hoarder
  - Site icon (16x16?)
  - Poison splatter
  - More sodas
