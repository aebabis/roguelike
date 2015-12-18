import { default as MenuBar } from "./MenuBar.js";
import { default as TestBootstrapper } from '../TestBootstrapper.js';

export default function() {
    var menu = new MenuBar();
    $('header').append(menu.getDom());
    TestBootstrapper();
};
