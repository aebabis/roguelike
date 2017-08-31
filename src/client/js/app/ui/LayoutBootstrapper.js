import MenuBar from './MenuBar.js';
import SharedUIDataController from '../controllers/SharedUIDataController.js';
import DungeonUIBootstrapper from './DungeonUIBootstrapper.js';

export default {
    bootstrap: function() {
        return new Promise(function(resolve) {
            window.addEventListener('load', function() {
                const sharedData = new SharedUIDataController();

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
                resolve(sharedData);
            });
        });
    }
};
