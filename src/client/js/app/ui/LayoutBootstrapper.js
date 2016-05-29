// http://stackoverflow.com/a/31770875/2993478
var req = require.context("../../../css", true, /^(.*\.(css$))[^.]*$/igm);
req.keys().forEach(function(key){
    req(key);
});

require('../../../../../node_modules/normalize.css/normalize.css');

import { default as MenuBar } from "./MenuBar.js";
import { default as TestBootstrapper } from '../TestBootstrapper.js';
import { default as Classes } from '../entities/creatures/classes/Classes.js';

window.addEventListener('load', function() {
    $('body').addClass('theme-default').append(`
        <header></header>
        <section class="game"></section>
        <footer></footer>`);
    var menu = new MenuBar();
    $('header').append(menu.getDom());
    TestBootstrapper(false);
});
