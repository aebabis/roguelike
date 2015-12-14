/**
 * @class Observable
 * @abstract
 * @description An implementation of the Observer pattern.
 * Add observer functions with `addObserver`. They will
 * be called whenever the Observable object calls `notifyObservers`.
 * @todo More comments
 */
export default class Observable {
    constructor() {
        this._observers = [];
    }

    _getObservers() {
        return this._observers || (this._observers = []);
    }

    /**
     * @function addObserver
     * @description Adds an observer function to the object. The function
     * will be called whenever the object notifies with a state change.
     */
    addObserver(observer) {
        if(typeof observer !== 'function') {
            throw new Error('observer must be a function');
        }
        var observers = this._getObservers();
        if(observers.indexOf(observer) >= 0) {
            throw new Error('duplicate observer');
        }
        observers.push(observer);
    }

    /**
     * @function removeObserver
     * @description Removes an observer added with `addObserver`.
     */
    removeObserver(observer) {
        if(typeof observer !== 'function') {
            throw new Error('observer must be a function');
        }
        var observers = this._getObservers();
        var index = observers.indexOf(observer);
        if(index < 0) {
            throw new Error('observer not found in observers');
        }
        observer.splice(index, 1);
    }

    _notifyObservers(message) {
        this._getObservers().forEach(function(func) {
            try {
                func(message);
            } catch(error) {
                console.error(error);
            }
        });
    }
}
