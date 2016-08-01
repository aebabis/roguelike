import TestBootstrapper from '../TestBootstrapper.js';
import CharacterBuilder from './CharacterBuilder.js';

function template() {
    return $(`
        <div class="menu-bar">
            <button class="newgame">New Game</button>
            <button class="restart">Restart</button>
            <label>Remember Previous Level <input type="checkbox" ${localStorage.repeatPreviousLevel === 'true' ? 'checked' : ''}></label>
        </div>`);
}

export default class MenuBar {
    constructor() {
        this._dom = template()
        .on('click', '.newgame', function() {
            new CharacterBuilder().getCharacter().then(function(character) {
                TestBootstrapper(true, character);
            });
        }).on('click', '.restart', function() {
            new CharacterBuilder().getCharacter().then(function(character) {
                TestBootstrapper(false, character);
            });
        }).on('change', 'input', function() {
            localStorage.repeatPreviousLevel = $(this).prop('checked');
        });
    }

    getDom() {
        return this._dom;
    }
}
