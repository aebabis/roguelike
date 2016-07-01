import TestBootstrapper from '../src/client/js/app/TestBootstrapper.js';
import PlayableCharacter from '../src/client/js/app/entities/creatures/PlayableCharacter.js';

var jsdom = require('jsdom').jsdom;
global.Random = require('random-js');

global.document = jsdom(`
    <html>
    <head>
        <script></script>
    </head>
    <body>
        <header></header>
        <section class='game' tabindex='0'></section>
        <footer></footer>
    </body>
    </html>`);
global.window = global.document.defaultView;
global.localStorage = {};
global.$ = require('jquery');

TestBootstrapper(true, new PlayableCharacter());
