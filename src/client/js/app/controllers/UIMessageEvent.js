// TODO: Should this share a super class with GameEvent?
export default class UIMessageEvent {
    /**
      * @class UIMessageEvent
      * @description
      */
    constructor(message) {
        this._message = message;
    }

    /**
     * @function getText()
     * @description A text description of the event
     * @return {String}
     */
    getText() {
        return this._message;
    }
}
