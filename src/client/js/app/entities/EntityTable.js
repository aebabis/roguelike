import Entity from "./Entity.js";

export default class EntityTable {
    /**
      * @class EntityTable
      * @description Base class for RNG table for random enemies
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

    addEntry(entry) {
        if(typeof entry !== 'object') {
            throw new Error('Entry must be an Object');
        }
        this._entries.push({
            entity: entry.entity,
            weight: entry.weight,
            cost: entry.cost
        });
    }

    rollEntry(dungeon, prng, costLimit) {
        var available = this._entries.filter((item)=>(item.cost<=costLimit));
        if(available.length === 0) {
            return null;
        }
        var totalWeight = available.reduce(function(prev, item) {
            return prev + item.weight;
        }, 0);
        var target = Random.real(0, totalWeight)(prng);
        var runningTotal = 0;
        var entry = available.find(function(entry) {
            runningTotal += entry.weight;
            return target <= runningTotal;
        });
        return {
            entity: new entry.entity(dungeon),
            cost: entry.cost
        };
    }

    rollEntries(dungeon, prng, costLimit) {
        var list = [];
        var result;
        while(result = this.rollEntry(dungeon, prng, costLimit)) {
            costLimit -= result.cost;
            list.push(result.entity);
        }
        return list;
    }
}
