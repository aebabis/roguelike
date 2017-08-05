import Moves from '../entities/creatures/moves/Moves.js';
import GameEvents from '../events/GameEvents.js';
import Dungeon from '../dungeons/Dungeon.js';
import ItemDomFactory from './ItemDomFactory.js';

function getInventoryDom(creature, targettedIndex) {
    const meleeWeapon = creature.getMeleeWeapon();
    const rangedWeapon = creature.getRangedWeapon();
    const armor = creature.getArmor();
    const items = creature.getInventory().getBackpack();
    const inventoryDom = document.createElement('ul');
    inventoryDom.classList.add('inventory');

    const equipmentDom = document.createElement('div');
    equipmentDom.classList.add('subinventory', 'equipment');
    equipmentDom.innerHTML = '<h3>Equipment</h3>';
    equipmentDom.appendChild(ItemDomFactory.getWeaponDom(meleeWeapon));
    equipmentDom.appendChild(ItemDomFactory.getWeaponDom(rangedWeapon));
    equipmentDom.appendChild(ItemDomFactory.getArmorDom(armor));

    const backpackDom = document.createElement('div');
    backpackDom.classList.add('subinventory', 'backpack');
    backpackDom.innerHTML = '<h3>Backpack</h3>';
    items.map((item, index) =>
        ItemDomFactory.getItemDom(item, index, index === targettedIndex)
    ).forEach(dom => backpackDom.appendChild(dom));

    inventoryDom.appendChild(equipmentDom);
    inventoryDom.appendChild(backpackDom);
    return inventoryDom;
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(sharedData) {
        const dom = this._dom = document.createElement('div');
        this._sharedData = sharedData;

        const focusGame = () => document.querySelector('section.game').focus();
        const itemHandler = ({target}) => {
            if (!target.classList.contains('item')) {
                return;
            }
            const dungeon = sharedData.getDungeon();
            const player = dungeon.getPlayableCharacter();
            const index = target.getAttribute('data-index');
            const item = player.getInventory().getItem(index);
            if(item.isTargetted && item.isTargetted()) {
                const targetIndex = sharedData.getTargettedItem();
                if(targetIndex !== index) {
                    sharedData.setTargettedItem(index);
                } else {
                    sharedData.unsetTargettedItem();
                }
            } else {
                player.setNextMove(new Moves.UseItemMove(dungeon.getTile(player), index));
            }
            dungeon.resolveUntilBlocked();
            focusGame();
        };

        dom.addEventListener('click',  itemHandler);
        dom.addEventListener('tap', itemHandler);

        dom.addEventListener('click', ({target}) => {
            event.stopPropagation(); // Prevent parent "button" from being clicked
            if (!target.classList.contains('trash')) {
                return;
            }

            const dungeon = sharedData.getDungeon();
            const player = dungeon.getPlayableCharacter();
            const index = +target.getAttribute('data-index');
            player.setNextMove(new Moves.TrashItemMove(dungeon.getTile(player), index));
            dungeon.resolveUntilBlocked();
            focusGame();
        });

        dom.addEventListener('click', ({target}) => {
            event.stopPropagation(); // Prevent parent "button" from being clicked
            if (!target.classList.contains('home')) {
                return;
            }
            const home = sharedData.getDungeon().getTiles(tile => tile.constructor.name === 'EntranceTile')[0];
            const x = home.getX();
            const y = home.getY();
            sharedData.pathTo(x, y);
            focusGame();
        });

        sharedData.addObserver((event)=>this.update(event));
        this.redraw();
    }

    update(event) {
        if(event instanceof GameEvents.InventoryChangeEvent || event instanceof Dungeon) {
            this.redraw();
        }
    }

    redraw() {
        const dom = this._dom;
        dom.innerHTML = '';
        dom.appendChild(
            getInventoryDom(this._sharedData.getDungeon().getPlayableCharacter(), this._sharedData.getTargettedItem())
        );
    }

    getDom() {
        return this._dom;
    }
}
