import { default as Creature } from "./Creature.js";
import { default as PlayableCharacter } from "./PlayableCharacter.js";
import { default as Strategies } from "./strategies/Strategies.js";

import { default as Stick } from "../weapons/Stick.js";
import { default as Fireball } from "../../abilities/Fireball.js";

export default class Witch extends Creature {
    constructor() {
        super();
        this.setMeleeWeapon(new Stick());
        this.addAbility(new Fireball());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.AggressiveFireballStrategy(),
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 3;
    }

    getBaseMana() {
        return 10;
    }

    getSpeed() {
        return 550;
    }
}
