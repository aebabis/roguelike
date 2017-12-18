import CharacterBuilder from './CharacterBuilder';
import Companions from '../entities/creatures/companions/Companions';
import DungeonPicker from './DungeonPicker';
import UserProgressService from '../services/UserProgressService';
import RandomMapDungeonFactory from '../dungeons/RandomMapDungeonFactory';
import TutorialLayoutGenerator from '../dungeons/generators/layouts/TutorialLayoutGenerator';
import TutorialScenarioTriggers from './TutorialScenarioTriggers';
import GameEvents from '../events/GameEvents';

import DialogService from './DialogService';

import DebugConsole from '../util/DebugConsole';

const getPrng = (newSeed) => {
    const prng = Random.engines.mt19937();
    if(localStorage.lastSeed && !newSeed) {
        prng.seed(localStorage.lastSeed);
    } else {
        prng.seed(localStorage.lastSeed = +new Date());
    }
    DebugConsole.log(localStorage.lastSeed);
    return prng;
};

export default class MenuFlowsController {
    constructor(sharedData) {
        this._sharedData = sharedData;
    }

    startTutorialCheckFlow() {
        if(!UserProgressService.hasCompletedTutorial()) {
            DialogService.showFormDialog('It looks like this is your first visit. Would you like to play the tutorial?', {
                buttons: [{
                    content: 'OK',
                    handler: () => {
                        let dungeon = TutorialLayoutGenerator.generate();
                        this._sharedData.setDungeon(dungeon);
                        dungeon.resolveUntilBlocked();
                        dungeon.getEventStream().subscribe((event) => {
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
                        this.startNewGameFlow();
                    }
                }]
            });
        } else {
            this.startNewGameFlow(false, localStorage.repeatPreviousLevel === 'true');
        }
    }

    startNewGameFlow(
        repeatCharacter = false,
        repeatMap = false
    ) {
        const getCharacter = repeatCharacter ?
            CharacterBuilder.copyLastCharacter() :
            new CharacterBuilder().getCharacter();
        getCharacter.then((character) => {
            const dungeon = new RandomMapDungeonFactory().getRandomMap(getPrng(!repeatMap), character);
            const characterLocation = dungeon.getTile(character);
            const kitty = new Companions.Kitten();
            const kittyTile = characterLocation.getNeighbors8(dungeon).filter(tile => kitty.canOccupyNow(tile))[0];
            dungeon.moveCreature(kitty, kittyTile.getX(), kittyTile.getY());

            this._sharedData.setDungeon(dungeon);
            dungeon.resolveUntilBlocked();
            this.handleEndGame(dungeon);
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
            this.handleEndGame(dungeon);
        });
    }

    handleEndGame(dungeon) {
        dungeon.getEventStream().subscribe(event => {
            if(event instanceof GameEvents.DefeatEvent || event instanceof GameEvents.VictoryEvent) {
                this.openEndGameDialog(dungeon.getGameConditions().hasPlayerWon(dungeon));
            }
        });
    }

    openEndGameDialog(isVictory) {
        const header = document.createElement('h2');
        header.innerText = isVictory ? 'Victory' : 'Defeat';
        const buttons = isVictory ? [{
            content: 'Next Game',
            handler: () => this.startNewGameFlow(true, false)
        }, {
            content: 'Build Character',
            handler: () => this.startNewGameFlow(false, false)
        }] : [{
            content: 'Try Again',
            handler: () => this.startNewGameFlow(true, true)
        }, {
            content: 'New Map',
            handler: () => this.startNewGameFlow(false, false)
        }];
        DialogService.showFormDialog(header, { buttons }).catch(e => console.error(e));
    }
}
