import CharacterBuilder from './CharacterBuilder.js';
import DungeonPicker from './DungeonPicker.js';

import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory.js';
import DebugConsole from '../util/DebugConsole.js';
import LightweightDungeonSerializer from '../dungeons/LightweightDungeonSerializer.js';

import Account from '../../account/Account.js';

function template() {
    return $(`
        <div class="menu-bar">
            <button class="newgame" accesskey="n">New Game</button>
            <button class="restart" accesskey="r">Restart</button>
            <button class="load" accesskey="l">Load</button>
            <button class="upload" accesskey="u">Upload</button>
            <label>Remember Previous Level <input type="checkbox" ${localStorage.repeatPreviousLevel === 'true' ? 'checked' : ''}></label>
        </div>`);
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
        this._dom = template()
        .on('click', '.newgame', function() {
            new CharacterBuilder().getCharacter().then(function(character) {
                sharedData.setDungeon(new RandomMapDungeonFactory().getRandomMap(getPrng(true), character));
            });
        }).on('click', '.restart', function() {
            new CharacterBuilder().getCharacter().then(function(character) {
                sharedData.setDungeon(new RandomMapDungeonFactory().getRandomMap(getPrng(false), character));
            });
        }).on('click', '.load', function() {
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
        }).on('click', '.upload', function() {
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
                })
            }).catch(function(reason) {
                alert(reason);
            })
        }).on('change', 'input', function() {
            localStorage.repeatPreviousLevel = $(this).prop('checked');
        });
    }

    getDom() {
        return this._dom;
    }
}
