// Quick debug script to check startGame function
console.log('=== Championship Tennis Debug Check ===');

// Check if startGame function exists
if (typeof startGame === 'function') {
    console.log('startGame function exists');
} else {
    console.log('startGame function is missing');
}

// Check if required elements exist
const requiredElements = ['loadingScreen', 'mainMenu'];
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`${id} element found`);
        console.log(`   - Classes: ${element.className}`);
        console.log(`   - Display: ${getComputedStyle(element).display}`);
    } else {
        console.log(`${id} element missing`);
    }
});

// Check tutorial overlay
const tutorial = document.getElementById('tutorialOverlay');
if (tutorial) {
    console.log(`Tutorial overlay found`);
    console.log(`   - Classes: ${tutorial.className}`);
    console.log(`   - Display: ${getComputedStyle(tutorial).display}`);
} else {
    console.log('Tutorial overlay not found');
}

// Test startGame function if it exists
if (typeof startGame === 'function') {
    console.log('🧪 Testing startGame function...');
    try {
        // startGame();
        console.log('startGame function call would be executed here');
    } catch (error) {
        console.error('Error calling startGame:', error);
    }
}