export default class CostedDistributionTable {
    /**
      * @class CostedDistributionTable 
      * @description A roll table for generating objects, optionally with costs
      */
    constructor(entries) {
        this._entries = [];
        if(entries) {
            if(!Array.isArray(entries)) {
                throw new Error('Optional first parameter must be an Array');
            }
            entries.forEach((entry)=>this.addEntry(entry));
        }
    }

    addEntry({value, weight, cost = 0}) {
        this._entries.push({ value, weight, cost });
    }

    rollEntry(prng, costLimit = Infinity) {
        const available = this._entries.filter((item)=>(item.cost <= costLimit));
        if(available.length === 0) {
            return null;
        }
        const totalWeight = available.reduce((prev, item) => prev + item.weight, 0);
        const target = Random.real(0, totalWeight)(prng);
        let runningTotal = 0;
        const { value } = available.find(({weight}) => {
            runningTotal += weight;
            return target <= runningTotal;
        });
        if(value != null && value.toString().indexOf('class') !== -1) {
            return new value();
        } else if(typeof value === 'function') {
            return value();
        } else {
            return value;
        }
    }

    rollEntries(prng, costLimit = Infinity) {
        const results = [];
        let available = this._entries;
        while(available.length > 0) {
            available = available.filter((item)=>(item.cost <= costLimit));
            if(available.length === 0) {
                break;
            }
            const totalWeight = available.reduce((prev, item) => prev + item.weight, 0);
            const target = Random.real(0, totalWeight)(prng);
            let runningTotal = 0;
            const { value, cost } = available.find(({weight}) => {
                runningTotal += weight;
                return target <= runningTotal;
            });
            costLimit -= cost;
            if(value != null && value.toString().indexOf('class') !== -1) {
                results.push(new value());
            } else if(typeof value === 'function') {
                results.push(value());
            } else {
                results.push(value);
            }
        }
        return results;
    }

    getCost(target) {
        return this._entries.find(({value}) => value === target || value === target.constructor).cost;
    }
}
