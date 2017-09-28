import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory';
import LightweightDungeonSerializer from '../dungeons/LightweightDungeonSerializer';

import Account from '../../account/Account';

function template() {
    const menuBar = document.createElement('div');
    menuBar.classList.add('menu-bar');
    menuBar.innerHTML = `
        <button class="newgame" accesskey="n">New Game</button>
        <button class="restart" accesskey="r">Restart</button>
        <button class="load" accesskey="l">Load</button>
        <button class="upload" accesskey="u">Upload</button>
        <label>Remember Previous Level <input type="checkbox" ${localStorage.repeatPreviousLevel === 'true' ? 'checked' : ''}></label>
    `;
    return menuBar;
}

export default class MenuBar {
    constructor(menuFlowsController) {
        const dom = this._dom = template();
        dom.querySelector('.newgame').addEventListener('click', () => menuFlowsController.startNewGameFlow());
        dom.querySelector('.restart').addEventListener('click', () => menuFlowsController.startRestartMapFlow());
        dom.querySelector('.load').addEventListener('click', () => menuFlowsController.startLoadGameFlow());
        dom.querySelector('.upload').addEventListener('click', function() {
            Account.getAuthToken().then(function(token) {
                const method = 'POST';
                const headers = new Headers();
                headers.set('Authorization', `Bearer ${token}`);
                headers.set('Content-Type', 'application/json');

                const prng = Random.engines.mt19937();
                prng.seed(localStorage.lastSeed);
                const dungeon = new RandomMapDungeonFactory().getRandomMap(prng, null);
                const body = JSON.stringify(LightweightDungeonSerializer.serialize(dungeon));

                return fetch(new Request('/dungeons', {
                    method,
                    headers,
                    body
                })).then(function(response) {
                    if(response.ok) {
                        alert('Dungeon uploaded');
                    } else {
                        alert(response.statusText);
                    }
                });
            }).catch(function(reason) {
                alert(reason);
            });
        });
        dom.querySelector('input').addEventListener('change', function() {
            localStorage.repeatPreviousLevel = this.checked;
        });
    }

    getDom() {
        return this._dom;
    }
}
