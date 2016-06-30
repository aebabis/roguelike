// http://stackoverflow.com/a/31770875/2993478
var req = require.context('../../../css', true, /\.scss$/);
req.keys().forEach(function(key){
    req(key);
});

require('../../../../../node_modules/normalize.css/normalize.css');
import CharacterBuilder from './CharacterBuilder.js';

import MenuBar from './MenuBar.js';
import TestBootstrapper from '../TestBootstrapper.js';

window.addEventListener('load', function() {
    $('body').addClass('theme-default').append(`
        <header></header>
        <section class='game' tabindex='0'></section>
        <footer></footer>`);
    var menu = new MenuBar();
    $('header').append(menu.getDom());
    new CharacterBuilder().getCharacter().then(function(character) {
        TestBootstrapper(false, character);
    });
});
