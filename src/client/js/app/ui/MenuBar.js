import CharacterBuilder from './CharacterBuilder.js';
import DungeonPicker from './DungeonPicker.js';

import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory.js';
import DebugConsole from '../util/DebugConsole.js';
import LightweightDungeonSerializer from '../dungeons/LightweightDungeonSerializer.js';

import Account from '../../account/Account.js';

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

function getPrng(newSeed) {
    const prng = Random.engines.mt19937();
    if(localStorage.lastSeed && !newSeed) {
        prng.seed(localStorage.lastSeed);
    } else {
        prng.seed(localStorage.lastSeed = +new Date());
    }
    DebugConsole.log(localStorage.lastSeed);
    return prng;
}

export default class MenuBar {
    constructor(sharedData) {
        const dom = this._dom = template();
        dom.querySelector('.newgame').addEventListener('click', function() {
            new CharacterBuilder().getCharacter().then(function(character) {
                sharedData.setDungeon(new RandomMapDungeonFactory().getRandomMap(getPrng(true), character));
            });
        });
        dom.querySelector('.restart').addEventListener('click', function() {
            new CharacterBuilder().getCharacter().then(function(character) {
                sharedData.setDungeon(new RandomMapDungeonFactory().getRandomMap(getPrng(false), character));
            });
        });
        dom.querySelector('.load').addEventListener('click', function() {
            const getDungeon = new DungeonPicker().getDungeon();
            const getCharacter = new CharacterBuilder().getCharacter();

            Promise.all([getDungeon, getCharacter]).then(function([dungeon, character]) {
                dungeon.forEachTile(function(tile, x, y) {
                    if(tile.getName() === 'Entrance') { // TODO: Make this more robust
                        dungeon.moveCreature(character, x, y);
                    }
                });
                sharedData.setDungeon(dungeon);
            });
        });
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
