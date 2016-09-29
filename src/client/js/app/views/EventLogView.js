import GameEvents from '../events/GameEvents.js';

import UIMessageEvent from '../controllers/UIMessageEvent.js';

export default class EventLogView {
    /**
     * @class EventLogView
     * @description Event feed widget
     */
    constructor(sharedData) {
        var scrollPane = this._scrollPane = document.createElement('div');
        scrollPane.classList.add('log-scroll');
        var log = document.createElement('div');
        log.classList.add('log');
        log.setAttribute('aria-live', 'polite');
        log.setAttribute('data-locked-bottom', true);
        scrollPane.appendChild(log);

        function observer(event) {
            if(event && event.getText &&
                    !(event instanceof GameEvents.HumanToMoveEvent ||
                    event instanceof GameEvents.HumanMovingEvent ||
                    event instanceof GameEvents.InventoryChangeEvent ||
                    event instanceof GameEvents.PositionChangeEvent)) {
                var dungeon = sharedData.getDungeon();
                if(dungeon && (!event.isSeenBy || event.isSeenBy(dungeon, dungeon.getPlayableCharacter()))) {
                    var message = document.createElement('div');
                    message.textContent = /*"<" + event.getTimestamp() + "> " +*/ event.getText(dungeon);
                    if(event instanceof UIMessageEvent) {
                        message.classList.add('ui-error');
                    }
                    log.appendChild(message);
                    checkScroll();
                }
            }
        }

        sharedData.addObserver(observer);

        scrollPane.addEventListener('scroll', function() {
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
