import CharacterBuilder from './CharacterBuilder.js';
import DungeonUIBootstrapper from './DungeonUIBootstrapper.js';
import UserProgressService from '../services/UserProgressService.js';
import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory.js';
import TutorialLayoutGenerator from '../dungeons/generators/layouts/TutorialLayoutGenerator.js';
import TutorialScenarioTriggers from './TutorialScenarioTriggers.js';
import GameEvents from '../events/GameEvents.js';

import DebugConsole from '../DebugConsole.js';

function getPrng(newSeed) {
    var prng = Random.engines.mt19937();
    if(localStorage.lastSeed && !newSeed) {
        prng.seed(localStorage.lastSeed);
    } else {
        prng.seed(localStorage.lastSeed = +new Date());
    }
    DebugConsole.log(localStorage.lastSeed);
    return prng;
}

function newGame() {
    new CharacterBuilder().getCharacter().then(function(character) {
        DungeonUIBootstrapper(new RandomMapDungeonFactory().getRandomMap(getPrng(false), character));
    });
}

export default {
    start: function() {
        if(!UserProgressService.hasCompletedTutorial()) {
            $('<div>').text('It looks like this is your first visit. Would you like to play the tutorial?').dialog({
                buttons: [{
                    text: 'OK',
                    click: function() {
                        $(this).dialog('close');
                        let dungeon = TutorialLayoutGenerator.generate();
                        DungeonUIBootstrapper(dungeon);
                        dungeon.addObserver(function(event) {
                            if(event instanceof GameEvents.VictoryEvent) {
                                UserProgressService.markTutorialComplete();
                            }
                        });
                        TutorialScenarioTriggers.bind(dungeon);
                    }
                }, {
                    text: 'No thanks',
                    click: function() {
                        $(this).dialog('close');
                        UserProgressService.markTutorialComplete();
                        newGame();
                    }
                }]
            });
        } else {
            newGame();
        }
    }
};
