// http://stackoverflow.com/a/31770875/2993478
var req = require.context("../../../css", true, /^(.*\.(css$))[^.]*$/igm);
req.keys().forEach(function(key){
    req(key);
});

import { default as MenuBar } from "./MenuBar.js";
import { default as TestBootstrapper } from '../TestBootstrapper.js';
import { default as Classes } from '../entities/creatures/classes/Classes.js';

//export default function() {
    var menu = new MenuBar();
    $('header').append(menu.getDom());
    TestBootstrapper(false);
//};
