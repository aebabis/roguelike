import { default as GameEvent } from "../events/GameEvent.js";

export default class EventLogView {
    /**
     * @class EventLogView
     * @description Event feed widget
     */
    constructor(dungeon) {
        var self = this;
        var scrollPane = this._scrollPane = document.createElement('div');
        scrollPane.classList.add('log-scroll');
        var log = document.createElement('div');
        log.classList.add('log');
        log.setAttribute('aria-live', 'polite');
        log.setAttribute('data-locked-bottom', true);
        scrollPane.appendChild(log);

        dungeon.addObserver(function(event) {
            if(event && event.getText) {
                var message = document.createElement('div');
                message.textContent = event.getText();
                log.appendChild(message);
                checkScroll();
            }
        });

        scrollPane.addEventListener('scroll', function(event) {
            log.setAttribute('data-locked-bottom', scrollPane.scrollTop + scrollPane.clientHeight === scrollPane.scrollHeight);
        });

        function checkScroll() {
            if(log.getAttribute('data-locked-bottom') === 'true') {
                scrollPane.scrollTop = Number.MAX_VALUE;
            }
        }
    }

    getDom() {
        return this._scrollPane;
    }
}
