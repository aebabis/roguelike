import Leap from '../abilities/Leap.js';
import GameEvents from '../events/GameEvents.js';

class Triggers {
    constructor(dungeon) {
        this._triggers = [];
        dungeon.addObserver((event) => {
            this._triggers
                .filter((trigger)=>trigger.enabled)
                .filter((trigger)=>trigger.condition(event, dungeon))
                .forEach((trigger)=>{
                    this.disableTrigger(trigger.name);
                    trigger.effect.call(this, event, dungeon);
                });
        });
    }

    addTrigger({name, enabled, condition, effect}) {
        if(typeof name !== 'string') {
            throw new Error('Illegal name');
        } else if(typeof condition !== 'function') {
            throw new Error('Illegal condition function');
        } else if(typeof effect !== 'function') {
            throw new Error('Illegal effect function');
        }
        this._triggers.push({
            name,
            enabled: !!enabled,
            condition,
            effect
        });
        return this;
    }

    enableTrigger(name) {
        this._triggers.find((trigger)=>trigger.name === name).enabled = true;
        return this;
    }

    disableTrigger(name) {
        this._triggers.find((trigger)=>trigger.name === name).enabled = false;
        return this;
    }
}

function setMessage(message, append) {
    var $elem = $('.tutorial-dialog');
    if(!$elem.length) {
        $elem = $('<div>').addClass('tutorial-dialog').dialog({
            position: {
                my: 'left top',
                at: 'left+5% top+40%'
            }
        });
    }
    if(!append) {
        $elem.empty();
    }
    $elem.append($('<p>').text(message)).dialog('open');
}

export default {
    bind: function(dungeon) {
        new Triggers(dungeon)
            .addTrigger({
                name: 'START',
                enabled: true,
                condition: function() {
                    return true;
                },
                effect: function() {
                    setMessage('Welcome to Git\'recht. lorem ipsum. To move around, click a tile near your character or use the num pad. Try moving down the hallway to the north');
                }
            })
            .addTrigger({
                name: 'OUT_OF_MANA',
                enabled: true,
                condition: function(event, dungeon) {
                    return dungeon.getPlayableCharacter().getCurrentMana() === 0;
                },
                effect: function() {
                    this.enableTrigger('OUT_OF_MANA');
                    dungeon.getPlayableCharacter().modifyMana(10);
                }
            })
            .addTrigger({
                name: 'LOW_HEALTH',
                enabled: true,
                condition: function(event, dungeon) {
                    return dungeon.getPlayableCharacter().getCurrentHP() < 4;
                },
                effect: function() {
                    dungeon.getPlayableCharacter().heal(dungeon, 10);
                }
            })
            .addTrigger({
                name: 'FOUND_SWORD',
                enabled: true,
                condition: function(event, dungeon) {
                    return dungeon.getPlayableCharacter().getInventory().getMeleeWeapon();
                },
                effect: function() {
                    setMessage('You found a longsword, enabling you to attack adjacent enemies. Since you had no weapons, it was automatically equipped');
                }
            })
            .addTrigger({
                name: 'ENEMY_SPOTTED',
                enabled: true,
                condition: function(event, dungeon) {
                    return dungeon.getPlayableCharacter().getVisibleEnemies(dungeon).length > 0;
                },
                effect: function() {
                    setMessage('That void sphere is no match for your longsword. Move next to it, then click to attack it', true);
                }
            })
            .addTrigger({
                name: 'FOUND_SLINGSHOT',
                enabled: true,
                condition: function(event, dungeon) {
                    return dungeon.getPlayableCharacter().getInventory().getRangedWeapon();
                },
                effect: function() {
                    setMessage('Ranged weapons allow you to attack enemies at a distance. Use your slingshot to attack the void sphere down the hall');
                }
            })
            .addTrigger({
                name: 'ALL_ENEMIES_DESTROYED',
                enabled: true,
                condition: function(event, dungeon) {
                    return dungeon.getCreatures().length === 1;
                },
                effect: function(event, dungeon) {
                    dungeon.getPlayableCharacter().addAbility(new Leap());
                    setMessage('To get to the final room, you will need to use the Leap ability. Click the Leap button on the left (or press 1) and click to leap across the spike pits');
                }
            })
            .addTrigger({
                name: 'ACROSS_THE_PITS',
                enabled: true,
                condition: function(event, dungeon) {
                    let location = dungeon.getTile(dungeon.getPlayableCharacter());
                    return location.getX() > 6 && location.getY() > 5;
                },
                effect: function() {
                    setMessage('Almost there! Now grab the treasure, and return the entrance');
                }
            })
            .addTrigger({
                name: 'VICTORY',
                enabled: true,
                condition: function(event) {
                    return event instanceof GameEvents.VictoryEvent;
                },
                effect: function() {
                    setMessage('You\'ve successfully completed the tutorial. To try a harder level, click "New Game" in the upper-left');
                }
            });
    }
};
