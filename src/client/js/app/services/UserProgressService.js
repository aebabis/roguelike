export default {
    hasCompletedTutorial: function() {
        return localStorage.hasCompletedTutorial === 'true';
    },

    markTutorialComplete: function() {
        return localStorage.hasCompletedTutorial = true;
    }
};
