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
    window.jQuery = $;
    $.getScript('https://code.jquery.com/ui/1.11.4/jquery-ui.min.js').then(function() {
        $('body').addClass('theme-default').append(`
            <header></header>
            <section class='game' tabindex='0'></section>
            <footer></footer>`);
        var menu = new MenuBar();
        $('header').append(menu.getDom());
        new CharacterBuilder().getCharacter().then(function(character) {
            TestBootstrapper(localStorage.repeatPreviousLevel !== 'true', character);
        });
    });

    $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://code.jquery.com/ui/1.10.4/themes/swanky-purse/jquery-ui.css'
    }).appendTo('head');
});
