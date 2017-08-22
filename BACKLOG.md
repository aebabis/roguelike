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
  - Keybindings Overlay
  - Tile Contents Panel (Use + and - to navigate?)
  - Handle legal noPath situations
  - Method for getting a single adjacent tile from a direction
  - Keyboard and mouse instructions
  - BlockTheExit strategy
  - Let player know their speed
  - Animate death frame (instead of ending). Camera
  - Potion of flying
  - Use https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  - Make ranged enemies avoid getting in melee range
  - Offline-first
  - Rename distance functions
  - See corners when adjacent edges are in range (5/3 slope)
  - Non-default session store
  - Tell user they can't path onto an unvisited tile
  - Refactor pre-existing animations to use Animation class
  - Phase in new sprite CSS
- Low
  - In-game advice (don't flee fast enemies, remember abilities, find the treasure)
  - Weights for random dungeon rooms
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
  - Figure out why type inference doesn't work with ESDoc

## Content
  - Invisibility Spell
  - Teleport Spell
  - Deflection Spell?

## Bugs
  - Monsters on the same initiative collide?
  - Tooltips don't update on state change
  - Enemies try to move when they're snared
  - number hotkeys not working in firefox
  - Door opening animation should be delayed same as creature moving
  - Leap
    - should not let you jump to a solid tile
    - should not let you jump into a pit
  - There is a small delay on the first animation; probably the animation clock not advancing until first player event.
  - New visibility animations don't account for enemies affecting visibility (e.g. by opening a door)


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
  - Coin tile
  - Arrow
