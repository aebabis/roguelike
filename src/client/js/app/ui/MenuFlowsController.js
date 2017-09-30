import CharacterBuilder from './CharacterBuilder';
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
        new CharacterBuilder().getCharacter().then((character) => {
            const dungeon = new RandomMapDungeonFactory().getRandomMap(getPrng(!repeatMap), character);
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
        const subscription = dungeon.getEventStream().subscribe(event => {
            if(dungeon.hasEnded()) {
                this.openEndGameDialog(dungeon.getGameConditions().hasPlayerWon(dungeon));
                subscription.unsubscribe();
            }
        });
    }

    openEndGameDialog(isVictory) {
        const nextGame = 'Next Game';
        const buildCharacter = 'New Character';

        DialogService.showFormDialog(isVictory ? 'Victory' : 'Defeat', {
            buttons: [{
                content: nextGame,
                handler: () => this.startNewGameFlow(true, false)
            }, {
                content: buildCharacter,
                handler: () => this.startNewGameFlow(false, false)
            }]
        }).catch(e => console.error(e));
    }
}
