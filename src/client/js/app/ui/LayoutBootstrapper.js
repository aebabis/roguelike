import MenuBar from './MenuBar.js';

export default {
    bootstrap: function() {
        return new Promise(function(resolve, reject) {
            window.addEventListener('load', function() {
                window.jQuery = $;
                $.getScript('https://code.jquery.com/ui/1.11.4/jquery-ui.min.js').then(function() {
                    $('body').addClass('theme-default').append(`
                        <header></header>
                        <section class='game' tabindex='0'></section>
                        <footer></footer>`);
                    var menu = new MenuBar();
                    $('header').append(menu.getDom());
                }).then(resolve, reject);

                $('<link/>', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: 'https://code.jquery.com/ui/1.10.4/themes/swanky-purse/jquery-ui.css'
                }).appendTo('head');
            });
        });
    }
};
