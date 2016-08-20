import Moves from '../entities/creatures/moves/Moves.js';
import GameEvents from '../events/GameEvents.js';
import Dungeon from '../dungeons/Dungeon.js';
import ItemDomFactory from './ItemDomFactory.js';

function getInventoryDom(creature, targettedIndex) {
    const meleeWeapon = creature.getMeleeWeapon();
    const rangedWeapon = creature.getRangedWeapon();
    const armor = creature.getArmor();
    const items = creature.getInventory().getBackpack();
    return $('<ul class="inventory">')
        .append(
            $('<div class="subinventory equipment">')
                .append('<h3>Equipment</h2>')
                .append(ItemDomFactory.getWeaponDom(meleeWeapon))
                .append(ItemDomFactory.getWeaponDom(rangedWeapon))
                .append(ItemDomFactory.getArmorDom(armor))
            )
        .append(
            $('<div class="subinventory backpack">')
                .append('<h3>Backpack</h2>')
                .append(items.map(function(item, index) {
                    return ItemDomFactory.getItemDom(item, index, index === targettedIndex);
                }))
        );
}

export default class InventoryView {
    /**
     * @class InventoryView
     * @description Event feed widget
     */
    constructor(sharedData) {
        const dom = this._dom = $('<div>');
        this._sharedData = sharedData;

        $(dom).on('click tap', '.item', function() {
            const dungeon = sharedData.getDungeon();
            const player = dungeon.getPlayableCharacter();
            const index = +$(this).attr('data-index');
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
        });

        $(dom).on('click tap', 'button.trash', function(event) {
            event.stopPropagation(); // Prevent parent "button" from being clicked

            const dungeon = sharedData.getDungeon();
            const player = dungeon.getPlayableCharacter();
            const index = $(this).parent('.item').attr('data-index');
            player.setNextMove(new Moves.TrashItemMove(dungeon.getTile(player), index));
            dungeon.resolveUntilBlocked();
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
        $(this._dom).empty().append(getInventoryDom(this._sharedData.getDungeon().getPlayableCharacter(), this._sharedData.getTargettedItem()));
    }

    getDom() {
        return this._dom[0];
    }
}
