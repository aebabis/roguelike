import CharacterBuilder from './CharacterBuilder.js';
import UserProgressService from '../services/UserProgressService.js';
import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory.js';
import TutorialLayoutGenerator from '../dungeons/generators/layouts/TutorialLayoutGenerator.js';
import TutorialScenarioTriggers from './TutorialScenarioTriggers.js';
import GameEvents from '../events/GameEvents.js';

import DialogService from './DialogService.js';

import DebugConsole from '../util/DebugConsole.js';

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

function newGame(sharedData) {
    new CharacterBuilder().getCharacter().then(function(character) {
        const dungeon = new RandomMapDungeonFactory().getRandomMap(getPrng(localStorage.repeatPreviousLevel !== 'true'), character);
        sharedData.setDungeon(dungeon);
        dungeon.resolveUntilBlocked();
    });
}

export default {
    start: function(sharedData) {
        if(!UserProgressService.hasCompletedTutorial()) {
            DialogService.showFormDialog('It looks like this is your first visit. Would you like to play the tutorial?', {
                buttons: [{
                    content: 'OK',
                    handler: () => {
                        let dungeon = TutorialLayoutGenerator.generate();
                        sharedData.setDungeon(dungeon);
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
                        newGame(sharedData);
                    }
                }]
            });
        } else {
            newGame(sharedData);
        }
    }
};
