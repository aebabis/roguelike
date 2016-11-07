import CharacterBuilder from './CharacterBuilder.js';

import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory.js';
import DebugConsole from '../DebugConsole.js';

function template() {
    return $(`
        <div class="menu-bar">
            <button class="newgame" accesskey="n">New Game</button>
            <button class="restart" accesskey="r">Restart</button>
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
        }).on('change', 'input', function() {
            localStorage.repeatPreviousLevel = $(this).prop('checked');
        });
    }

    getDom() {
        return this._dom;
    }
}
