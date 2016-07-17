# Backlog
## Technical
- High
  - Puzzles/Level-Select
  - Better dungeon generator
  - Using keyboard to look at tiles
  - Button to focus abilities. Arrows to move between
  - Fixed container size. Autoscroll during move
  - Special inventory slot for TheTreasure?
  - Make enemies drop their items
  - Improve/clarify interface for repositioning creatures
- Med
  - Keybindings Overlay
  - Tile Contents Panel (Use + and - to navigate?)
  - Serialization for saving games (and as POC for client-server games)
  - Handle legal noPath situations
  - Ability to compare 2 dungeons, for testing dungeon factory regressions
  - Make all views get Dungeon from shared data
  - Method for getting a single adjacent tile from a direction
  - Keyboard and mouse instructions
  - Don't bundle jQuery with webpack
  - Webpack integration of coverage
  - Try flow or Typescript
  - DamageEvent for subtracting health. No animation for 0 damage
  - Path-to
  - You can see a solid tile if you can see any corner?
  - BlockTheExit strategy
  - Let player know their speed
- Low
  - Come up with a better name for "speed"
  - Option to hide health and action bars
  - Site icon
  - Animation speed
  - Consider splitting source/target events into two events
  - Icon to indicate an enemy about to take a double-move
  - Optimize webpack (http://jamesknelson.com/using-es6-in-the-browser-with-babel-6-and-webpack/), (https://github.com/babel/babel-loader#babel-loader-is-slow)
  - Further optimize vision algorithm
  - Use `fetch`
  - RandomStrategyStrategy
  - RandomAbilityStrategy
  - Color code damage types in UI
  - Make ClunkyNintiesCellPhone use predefined strategies
  - Range indicators
  - Test case for reflexivity of canSee

## Content
  - Invisibility Spell
  - Dash Attack
  - Teleport Spell

## Bugs
  - Monsters on the same initiative collide?
  - Tooltips don't update on state change

## Art
  - Snail icon
  - Rabbit icon
  - Horse archer
  - Horseless archer
  - Bow
  - Armor and Robes
  - Druid
  - Stairs tile
  - Trash can icon
  - Parchment scroll background image for game log
  - Knockback enemy
  - Hammer
