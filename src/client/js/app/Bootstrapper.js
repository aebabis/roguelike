import LayoutBootstrapper from './ui/LayoutBootstrapper';

// http://stackoverflow.com/a/31770875/2993478
var req = require.context('../../css', true, /\.scss$/);
req.keys().forEach(function(key){
    req(key);
});

require('../../../../node_modules/normalize.css/normalize.css');

LayoutBootstrapper.bootstrap().then(function(menuFlowsController) {
    menuFlowsController.startTutorialCheckFlow();
});

// TODO: Determine how to incorporate generated spritesheet
// CSS into bundle during build time.
const spriteCss = document.createElement('link');
spriteCss.rel = 'stylesheet';
spriteCss.href = 'images/sprites.css';
document.body.appendChild(spriteCss);