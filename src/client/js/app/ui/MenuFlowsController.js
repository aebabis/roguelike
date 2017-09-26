import CharacterBuilder from './CharacterBuilder';
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
