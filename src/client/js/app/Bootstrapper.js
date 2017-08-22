import LayoutBootstrapper from './ui/LayoutBootstrapper.js';
import MenuFlowsController from './ui/MenuFlowsController.js';

if (!Object.entries) {
    Object.entries = function(obj) {
        var ownProps = Object.keys( obj );
        var i = ownProps.length;
        var resArray = new Array(i); // preallocate the Array
        while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        }
        return resArray;
    };
}

// http://stackoverflow.com/a/31770875/2993478
var req = require.context('../../css', true, /\.scss$/);
req.keys().forEach(function(key){
    req(key);
});

require('../../../../node_modules/normalize.css/normalize.css');

LayoutBootstrapper.bootstrap().then(function(sharedData) {
    MenuFlowsController.start(sharedData);
});

// TODO: Determine how to incorporate generated spritesheet
// CSS into bundle during build time.
const spriteCss = document.createElement('link');
spriteCss.rel = 'stylesheet';
spriteCss.href = 'images/sprites.css';
document.body.appendChild(spriteCss);