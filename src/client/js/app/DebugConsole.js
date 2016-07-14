var getDom = (function() {
    var $dom;
    return function() {
        if(!$dom) {
            $dom = $(
                `<div class="debug-console">
                    <div class="feed"></div>
                    <button title="Show developer console">&#128435;</button>
                </div>`
            ).appendTo('section.game').on('click', 'button', function() {
                $dom.toggleClass('expanded');
            });
        }
        return $dom;
    };
})();

export default {
    log: function(message) {
        if(typeof message !== 'string') {
            message = JSON.stringify(message, null, 4);
        }
        getDom().find('.feed').append(`<pre class="message">${message}</pre>`);
    }
};
