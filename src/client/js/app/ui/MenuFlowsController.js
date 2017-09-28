import CharacterBuilder from './CharacterBuilder';
import DungeonPicker from './DungeonPicker';
import UserProgressService from '../services/UserProgressService';
import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory';
import TutorialLayoutGenerator from '../dungeons/generators/layouts/TutorialLayoutGenerator';
import TutorialScenarioTriggers from './TutorialScenarioTriggers';
import GameEvents from '../events/GameEvents';

import DialogService from './DialogService';

import DebugConsole from '../util/DebugConsole';

function getPrng(newSeed) {
    const prng = Random.engines.mt19937();
    if(localStorage.lastSeed && !newSeed) {
        prng.seed(localStorage.lastSeed);
    } else {
        prng.seed(localStorage.lastSeed = +new Date());
    }
    DebugConsole.log(localStorage.lastSeed);
    return prng;
}

export default class MenuFlowsController {
    constructor(sharedData) {
        this._sharedData = sharedData;
    }

    newGame(sharedData) {
        new CharacterBuilder().getCharacter().then(function(character) {
            const dungeon = new RandomMapDungeonFactory().getRandomMap(getPrng(localStorage.repeatPreviousLevel !== 'true'), character);
            sharedData.setDungeon(dungeon);
            dungeon.resolveUntilBlocked();
        });
    }

    start() {
        if(!UserProgressService.hasCompletedTutorial()) {
            DialogService.showFormDialog('It looks like this is your first visit. Would you like to play the tutorial?', {
                buttons: [{
                    content: 'OK',
                    handler: () => {
                        let dungeon = TutorialLayoutGenerator.generate();
                        this._sharedData.setDungeon(dungeon);
                        dungeon.resolveUntilBlocked();
                        dungeon.getEventStream().subscribe(function(event) {
                            if(event instanceof GameEvents.VictoryEvent) {
                                UserProgressService.markTutorialComplete();
                            }
                        });
                        TutorialScenarioTriggers.bind(dungeon);
                    }
                }, {
                    content: 'No thanks',
                    handler: () => {
                        UserProgressService.markTutorialComplete();
                        this.newGame(this._sharedData);
                    }
                }]
            });
        } else {
            this.newGame(this._sharedData);
        }
    }

    startNewGameFlow() {
        new CharacterBuilder().getCharacter().then((character) => {
            const dungeon = new RandomMapDungeonFactory().getRandomMap(getPrng(true), character);
            this._sharedData.setDungeon(dungeon);
            dungeon.resolveUntilBlocked();
        });
    }

    startRestartMapFlow() {
        new CharacterBuilder().getCharacter().then((character) => {
            const dungeon = new RandomMapDungeonFactory().getRandomMap(getPrng(false), character);
            this._sharedData.setDungeon(dungeon);
            dungeon.resolveUntilBlocked();
        });
    }

    startLoadGameFlow() {
        const getDungeon = new DungeonPicker().getDungeon();
        const getCharacter = new CharacterBuilder().getCharacter();

        Promise.all([getDungeon, getCharacter]).then(([dungeon, character]) => {
            dungeon.forEachTile((tile, x, y) => {
                if(tile.getName() === 'Entrance') { // TODO: Make this more robust
                    dungeon.moveCreature(character, x, y);
                }
            });
            this._sharedData.setDungeon(dungeon);
            dungeon.resolveUntilBlocked();
        });
    }

    startRepeatCharacterFlow() {

    }

    // Victory
    // buff.onAttack
    // pet stays exactly 2 tiles away or waits
    // Stoneskin
    // Cleric
}
