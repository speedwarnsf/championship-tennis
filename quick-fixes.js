// Quick fixes for Championship Tennis

// Fix 1: Enhanced startGame function with debug logging
const originalStartGame = window.startGame;
window.startGame = function() {
    console.log('🎾 startGame() called');
    
    try {
        if (!window.audio) {
            console.log('🔊 Initializing audio...');
            initAudio();
        }
        
        const loadingScreen = document.getElementById('loadingScreen');
        const mainMenu = document.getElementById('mainMenu');
        
        console.log('loadingScreen:', loadingScreen);
        console.log('mainMenu:', mainMenu);
        
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            console.log('✅ Removed active class from loading screen');
        }
        
        if (mainMenu) {
            mainMenu.classList.add('active');
            console.log('✅ Added active class to main menu');
        }
        
        if (typeof load === 'function') {
            load();
            console.log('✅ Called load()');
        }
        
        if (typeof updateUI === 'function') {
            updateUI();
            console.log('✅ Called updateUI()');
        }
        
        // Hide tutorial if it's showing
        const tutorial = document.getElementById('tutorialOverlay');
        if (tutorial && tutorial.classList.contains('active')) {
            tutorial.classList.remove('active');
            console.log('✅ Hid tutorial overlay');
        }
        
    } catch (error) {
        console.error('❌ Error in startGame:', error);
    }
};

// Fix 2: Ensure DOM is ready before attaching click handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM Content Loaded - fixing button handlers');
    
    // Find all buttons that should call startGame
    const playButtons = document.querySelectorAll('button[onclick*="startGame"]');
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Play button clicked');
            window.startGame();
        });
    });
});

console.log('🔧 Quick fixes loaded');