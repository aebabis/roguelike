import MenuBar from './MenuBar.js';
import SharedUIDataController from '../controllers/SharedUIDataController.js';
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
                    tmpDungeon.moveCreature(new Rogue(), 0, 0);
                    const sharedData = new SharedUIDataController(tmpDungeon);

                    const { body } = document;
                    body.classList.add('theme-default');
                    const header = document.createElement('header');
                    const game = document.createElement('section');
                    game.classList.add('game', 'gitrecht');
                    game.setAttribute('tabindex', '0');
                    game.setAttribute('role', 'application');
                    const footer = document.createElement('footer');

                    body.appendChild(header);
                    body.appendChild(game);
                    body.appendChild(footer);
                    
                    const menu = new MenuBar(sharedData);
                    header.appendChild(menu.getDom());

                    new DungeonUIBootstrapper(sharedData);
                    return sharedData;
                }).then(resolve, reject);

                const link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                link.setAttribute('href', 'https://code.jquery.com/ui/1.10.4/themes/swanky-purse/jquery-ui.css');
                document.head.appendChild(link);
            });
        });
    }
};
