import CharacterBuilder from './CharacterBuilder.js';
import DungeonUIBootstrapper from './DungeonUIBootstrapper.js';
import UserProgressService from '../services/UserProgressService.js';
import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory.js';

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

setTimeout(function() {
    if(!UserProgressService.hasCompletedTutorial() && confirm('Would you like to do the tutorial?')) {
        UserProgressService.markTutorialComplete();
    } else {
        new CharacterBuilder().getCharacter().then(function(character) {
            console.log(character);
            DungeonUIBootstrapper(new RandomMapDungeonFactory().getRandomMap(getPrng(false), character));
        });
    }
});
