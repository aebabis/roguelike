import { default as Classes } from '../entities/creatures/classes/Classes.js';

function template() {
    return $(`
        <dialog>
            <form method="dialog">
                ${Object.keys(Classes).sort().map(function(className) {
                    return `<input type="radio" name="class" value="${className}"> ${className}`
                })}
                <input type="submit" value="OK">
            </form>
        </dialog>`);
}

export default class CharacterBuilder {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        var $dialog = template().appendTo('body');
        var $form = $dialog.find('form').on('submit', (event) => {
            var data = new FormData($form[0]);
            this._resolve(Classes[data.get('class')]);
        });
        $dialog[0].showModal();
    }

    getCharacter() {
        return this._promise;
    }
}
