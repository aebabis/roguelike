import { default as MenuBar } from "./MenuBar.js";
import { default as TestBootstrapper } from '../TestBootstrapper.js';
import { default as Classes } from '../entities/creatures/classes/Classes.js';

export default function() {
    var menu = new MenuBar();
    $('header').append(menu.getDom());
    var classes = Object.keys(Classes);
    var index = Math.floor(Math.random() * classes.length);
    TestBootstrapper(Classes[classes[index]], false);
};
