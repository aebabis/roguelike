# Backlog
## Technical
- High
  - Puzzles/Level-Select
  - Using keyboard to look at tiles
  - Special inventory slot for TheTreasure?
  - Make enemies drop their items
  - Show enemy resistances in UI
- Med
  - Weights for random dungeon rooms
  - Keybindings Overlay
  - Tile Contents Panel (Use + and - to navigate?)
  - Serialization for saving games (and as POC for client-server games)
  - Handle legal noPath situations
  - Ability to compare 2 dungeons, for testing dungeon factory regressions
  - Method for getting a single adjacent tile from a direction
  - Keyboard and mouse instructions
  - Don't bundle jQuery with webpack
  - Webpack integration of coverage
  - Try flow or Typescript
  - You can see a solid tile if you can see any corner?
  - BlockTheExit strategy
  - Let player know their speed
  - Spell scroll compound sprites
  - Animate death frame (instead of ending)
  - Potion of flying
  - Queue animations
  - Use https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
- Low
  - Prevent room intersection in random dungeon generator
  - Come up with a better name for "speed"
  - Option to hide enemy health and action bars
  - Animation speed
  - Consider splitting source/target events into two events
  - Icon to indicate an enemy about to take a double-move
  - Optimize webpack (http://jamesknelson.com/using-es6-in-the-browser-with-babel-6-and-webpack/), (https://github.com/babel/babel-loader#babel-loader-is-slow)
  - Further optimize vision algorithm
  - Use `fetch`
  - RandomStrategyStrategy
  - RandomAbilityStrategy
  - Make ClunkyNintiesCellPhone use predefined strategies
  - Test case for reflexivity of canSee
  - Melee attack animation improvement
  - Move DebugConsole to util folder

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
  - Leap doesn't pickup items. Should it?

## Art
  - Snail icon
  - Rabbit icon
  - Robes
  - Druid
  - Stairs tile
  - Trash can icon
  - Parchment scroll background image for game log
  - Knockback enemy
  - Knight
  - Pillar
  - Magic sword
  - A PC who can tunnel (mole, miner, ect.)
  - Troll
  - Mimic
  - Dragon
  - Item hoarder
  - Site icon (16x16?)
