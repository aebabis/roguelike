import LightweightDungeonSerializer from '../dungeons/LightweightDungeonSerializer.js';

var dialogPolyfill = require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.js');
require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.css');

const promiseHandlers = {};

const angular = require('angular');

angular.module('dungeon-picker', [])
.component('dungeonInfo', {
    bindings: {
        data: '='
    },
    controller: function() {
    },
    templateUrl: 'dungeon-info.html'
})
.controller('dungeon-picker', ['$scope', 'promiseHandlers', function($scope, promiseHandlers) {
    const { resolve, reject } = promiseHandlers;

    $scope.loadDungeons = function(prevIndex = 0) {
        fetch(new Request(`/dungeons?lastId=${prevIndex}`, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })).then(response => {
            $scope.hasMore = response.headers.get('Has-More') === 'true';
            return response.json();
        }).then(function(dungeons) {
            $scope.dungeons = dungeons;
            $scope.dungeonJSON = JSON.stringify(dungeons, null, 4);
            $scope.$apply();
        });
    };

    $scope.setSelectedDungeon = function(index) {
        $scope.selectedIndex = index;
    };

    $scope.submit = function() {
        const index = $scope.selectedIndex;
        const struct = $scope.dungeons[index].data;
        const dungeon = LightweightDungeonSerializer.deserialize(struct);
        resolve(dungeon);
    };

    $scope.nextPage = function() {
        const lastItem = $scope.dungeons.slice(-1)[0];
        $scope.loadDungeons(lastItem.id);
    };

    $scope.loadDungeons();
}]).constant('promiseHandlers', promiseHandlers).run(['$templateCache', function($templateCache) {
    $templateCache.put('dungeon-info.html',
        `<div class="dungeon-info" data-id="{{$ctrl.data.id}}">
            Dimensions: {{$ctrl.data.width}} x {{$ctrl.data.height}}
        </div>`);
    $templateCache.put('dungeon-picker.html',
        `<div ng-controller="dungeon-picker">
            <form method="dialog" class="gitrecht" ng-submit="submit()">
                <h2>Select a Dungeon</h2>
                <button ng-repeat="dungeon in dungeons" ng-click="setSelectedDungeon($index)">
                    <dungeon-info data="dungeon"></dungeon-info>
                </button>
            </form>
            <button ng-if="hasMore" ng-click="nextPage()">Next Page</button>
        </div>`);
}]);

export default class DungeonPicker {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            const dialog = document.createElement('dialog');
            dialog.classList.add('dungeon-picker');
            dialog.innerHTML = '<ng-include src="\'dungeon-picker.html\'"></ng-include>';
            document.body.appendChild(dialog);

            if(!dialog.open) {
                dialogPolyfill.registerDialog(dialog);
            }

            promiseHandlers.resolve = resolve;
            promiseHandlers.reject = reject;

            angular.bootstrap(dialog, ['dungeon-picker']);

            dialog.showModal();
        });
    }

    getDungeon() {
        return this._promise;
    }
}
