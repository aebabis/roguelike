import { default as MenuBar } from "./MenuBar.js";
import { default as TestBootstrapper } from '../TestBootstrapper.js';
import { default as Classes } from '../entities/creatures/classes/Classes.js';

export default function() {
    var menu = new MenuBar();
    $('header').append(menu.getDom());
    TestBootstrapper(false);
};
