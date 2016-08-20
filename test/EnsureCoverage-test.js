global.Random = require('random-js');
var jsdom = require('jsdom').jsdom;

import DungeonUIBootstrapper from '../src/client/js/app/ui/DungeonUIBootstrapper.js';
import RandomMapDungeonFactory from '../src/client/js/app/dungeons/RandomMapDungeonFactory.js';
import Rogue from '../src/client/js/app/entities/creatures/classes/Rogue.js';

import '../src/client/js/polyfills/includes.js';


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

let prng = Random.engines.mt19937();
var seed = Math.random().toString().slice(2);
console.log(`Integration testing with seed: ${seed}`);
prng.seed(seed);
let dungeon = new RandomMapDungeonFactory().getRandomMap(prng, new Rogue());
DungeonUIBootstrapper(dungeon);
