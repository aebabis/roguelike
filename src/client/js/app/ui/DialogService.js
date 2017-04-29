var dialogPolyfill = require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.js');
require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.css');

export default {
    showFormDialog: (content, {
        classes = [],
        buttons = [{ content: 'Submit' }]
    }) => {
        return new Promise((resolve) => {
            const dialog = document.createElement('dialog');
            const classList = typeof classes === 'string'
                ? classes.split(/\w+/).filter(Boolean)
                : classes;
            dialog.classList.add(...classList);

            const form = document.createElement('form');
            form.setAttribute('method', 'dialog');
            dialog.appendChild(form);

            if (typeof content === 'string') {
                form.textContent = content;
            } else {
                form.appendChild(content);
            }

            document.body.appendChild(dialog);

            if(!dialog.open) {
                dialogPolyfill.registerDialog(dialog);
            }

            let activatedHandler;
            if(buttons) {
                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
                buttons.forEach(({content, handler}) => {
                    const button = document.createElement('button');
                    if (typeof content === 'string') {
                        button.textContent = content;
                    } else {
                        button.appendChild(content);
                    }
                    button.addEventListener('click', () => activatedHandler = handler);
                    buttonContainer.appendChild(button);
                });
                form.appendChild(buttonContainer);
            }

            form.addEventListener('submit', () => {
                const data = new FormData(form);
                activatedHandler(data);
                resolve(data);
            });

            dialog.showModal();
        });
    }
};
