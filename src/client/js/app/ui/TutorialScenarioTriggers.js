import Leap from '../abilities/Leap';
import GameEvents from '../events/GameEvents';

class Triggers {
    constructor(dungeon) {
        this._triggers = [];
        this._dungeon = dungeon;
        dungeon.getEventStream().subscribe(
            event => this._handleEvent(event)
        );
    }

    _handleEvent(event) {
        const dungeon = this._dungeon;
        this._triggers
            .filter((trigger)=>trigger.enabled)
            .filter((trigger)=>trigger.condition(event, dungeon))
            .forEach((trigger)=>{
                this.disableTrigger(trigger.name);
                trigger.effect.call(this, event, dungeon);
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

    checkConditions() {
        this._handleEvent(null);
        return this;
    }
}

const setMessage = (() => {
    const container = document.createElement('div');
    container.classList.add('message-container');

    return (message, append) => {
        if(!container.parentElement) {
            document.querySelector('.viewport-container').appendChild(container);
        }
        if(!append) {
            container.innerHTML = '';
        }
        const p = document.createElement('p');
        p.textContent = message;
        container.appendChild(p);
    };
})();

export default {
    bind: function(dungeon) {
        new Triggers(dungeon)
            .addTrigger({
                name: 'START',
                enabled: true,
                condition: () => true,
                effect: () =>
                    setMessage('Welcome to Git\'recht. To find the treasure, move using the mouse, numpad, or arrow keys')
            })
            .addTrigger({
                name: 'OUT_OF_MANA',
                enabled: true,
                condition: (event, dungeon) =>
                    dungeon.getPlayableCharacter().getCurrentMana() === 0,
                effect: () => {
                    this.enableTrigger('OUT_OF_MANA');
                    dungeon.getPlayableCharacter().modifyMana(dungeon, this, 10);
                }
            })
            .addTrigger({
                name: 'LOW_HEALTH',
                enabled: true,
                condition: (event, dungeon) => dungeon.getPlayableCharacter().getCurrentHP() < 4,
                effect: () => dungeon.getPlayableCharacter().heal(dungeon, this, 10),
            })
            .addTrigger({
                name: 'FOUND_SWORD',
                enabled: true,
                condition: (event, dungeon) => dungeon.getPlayableCharacter().getInventory().getMeleeWeapon(),
                effect: () => {
                    setMessage('You found a longsword, enabling you to attack adjacent enemies. Since you had no weapons, it was automatically equipped')
                }
            })
            .addTrigger({
                name: 'ENEMY_SPOTTED',
                enabled: true,
                condition: (event, dungeon) =>
                    dungeon.getPlayableCharacter().getVisibleEnemies(dungeon).length > 0,
                effect: () => {
                    setMessage('That void sphere is no match for your longsword. Move next to it, then click to attack it', true)
                }
            })
            .addTrigger({
                name: 'FOUND_SLINGSHOT',
                enabled: true,
                condition: (event, dungeon) => dungeon.getPlayableCharacter().getInventory().getRangedWeapon(),
                effect: () => {
                    setMessage('Ranged weapons allow you to attack enemies at a distance. Use your slingshot to attack the void sphere down the hall')
                }
            })
            .addTrigger({
                name: 'ALL_ENEMIES_DESTROYED',
                enabled: true,
                condition: (event, dungeon) => dungeon.getCreatures().length === 1,
                effect: (event, dungeon) => {
                    dungeon.getPlayableCharacter().addAbility(new Leap());
                    setMessage('To get to the final room, you will need to use the Leap ability. Click the Leap button on the left (or press 1) and click to leap across the spike pits');
                }
            })
            .addTrigger({
                name: 'ACROSS_THE_PITS',
                enabled: true,
                condition: (event, dungeon) => {
                    const location = dungeon.getTile(dungeon.getPlayableCharacter());
                    return location.getX() > 6 && location.getY() > 5;
                },
                effect: () => {
                    setMessage('Almost there! Now grab the treasure, and return the entrance');
                }
            })
            .addTrigger({
                name: 'VICTORY',
                enabled: true,
                condition: (event) => event instanceof GameEvents.VictoryEvent,
                effect: () => {
                    setMessage('You\'ve successfully completed the tutorial. To try a harder level, click "New Game" in the upper-left');
                }
            })
            .checkConditions();
    }
};
