import { default as TestBootstrapper } from '../TestBootstrapper.js';

function template() {
    return $(`
        <div class="menu-bar">
            <button class="restart">Restart</div>
        </div>`);
}

export default class MenuBar {
    constructor() {
        this._dom = template().on('click', '.restart', function() {
            TestBootstrapper();
        });
    }

    getDom() {
        return this._dom;
    }
}
