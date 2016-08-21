import MenuBar from './MenuBar.js';
import GraphicalViewSharedData from '../controllers/GraphicalViewSharedData.js';
import DungeonUIBootstrapper from './DungeonUIBootstrapper.js';
import Dungeon from '../dungeons/Dungeon.js';
import Rogue from '../entities/creatures/classes/Rogue.js';

export default {
    bootstrap: function() {
        return new Promise(function(resolve, reject) {
            window.addEventListener('load', function() {
                window.jQuery = $;
                $.getScript('https://code.jquery.com/ui/1.11.4/jquery-ui.min.js').then(function() {
                    const tmpDungeon = new Dungeon(1, 1); // TODO: Make views not crash without Dungeon
                    tmpDungeon.setCreature(new Rogue(), 0, 0);
                    const sharedData = new GraphicalViewSharedData(tmpDungeon);

                    $('body').addClass('theme-default').append(`
                        <header></header>
                        <section class='game' tabindex='0'></section>
                        <footer></footer>`);
                    const menu = new MenuBar(sharedData);
                    $('header').append(menu.getDom());

                    new DungeonUIBootstrapper(sharedData);
                    return sharedData;
                }).then(resolve, reject);

                $('<link/>', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: 'https://code.jquery.com/ui/1.10.4/themes/swanky-purse/jquery-ui.css'
                }).appendTo('head');
            });
        });
    }
};
