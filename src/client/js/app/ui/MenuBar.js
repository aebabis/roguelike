import { default as TestBootstrapper } from '../TestBootstrapper.js';
import { default as CharacterBuilder } from './CharacterBuilder.js';

function template() {
    return $(`
        <div class="menu-bar">
            <button class="newgame">New Game</button>
            <button class="restart">Restart</button>
        </div>`);
}

export default class MenuBar {
    constructor() {
        this._dom = template()
        .on('click', '.newgame', function() {
            new CharacterBuilder().getCharacter().then(function(CharacterClass) {
                TestBootstrapper(true, CharacterClass);
            })
        }).on('click', '.restart', function() {
            TestBootstrapper(false);
        });
    }

    getDom() {
        return this._dom;
    }
}
