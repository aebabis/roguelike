import LayoutBootstrapper from './ui/LayoutBootstrapper.js';
import MenuFlowsController from './ui/MenuFlowsController.js';

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