var getDom = (function() {
    var dom;
    return function() {
        if(!dom) {
            dom = document.createElement('div');
            dom.classList.add('debug-console');
            dom.innerHTML = `
                <div class="feed"></div>
                <button title="Show developer console">&#128435;</button>
            `;
            dom.querySelector('button').addEventListener('click', function() {
                dom.classList.toggle('expanded');
            });
            document.body.appendChild(dom);
        }
        return dom;
    };
})();

export default {
    log: function(message) {
        if(typeof message !== 'string') {
            message = JSON.stringify(message, null, 4);
        }
        const messageDom = document.createElement('pre');
        messageDom.textContent = message;
        getDom().querySelector('.feed').appendChild(messageDom);
    }
};
