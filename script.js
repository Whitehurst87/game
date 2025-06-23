document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const door1 = document.getElementById('door1');
    const door2 = document.getElementById('door2');
    const winResult = document.getElementById('win-result');
    const loseResult = document.getElementById('lose-result');
    const resetButton = document.getElementById('reset-button');
    
    // Game state
    let gameActive = true;
    let partyDoor = null;
    let audioEnabled = false;
    let partyModeSelected = false;
    let bearIconClicks = 0;
    
    // Pre-load audio files to improve playback chances
    const audioFiles = {
        'win': 'sound effects/win-cheering.mp3',
        'door_creak': 'sound effects/door.mp3',
        'bear_growl': 'sound effects/bear-growl.mp3',
        'bear_attack': 'sound effects/bear-attack.mp3',
        'bear_laugh': 'sound effects/laughter.mp3',
        'reset': 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
        'hidden_scream_1': 'sound effects/hidden-scream-1.mp3',
        'hidden_scream_2': 'sound effects/hidden-scream-2.mp3',
        'hidden_roar_1': 'sound effects/hidden-roar-1.mp3',
        'knock-on-door': 'sound effects/knock-on-door.mp3',
        'troll_story': 'sound effects/troll_story.mp3'
    };

    let audioContext;
    
    // Try to enable audio with user interaction
    document.addEventListener('click', function enableAudio() {
        // Create a silent audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.resume().then(() => {
            audioEnabled = true;
            document.removeEventListener('click', enableAudio);
        }).catch(e => {
            console.log('Could not enable audio context:', e);
        });
    }, { once: true });
    
    // Initialize the game
    initGame();
    
    // Event listeners
    door1.addEventListener('click', () => handleDoorClick(door1, 1));
    door1.addEventListener('touchstart', handleDoorTouchStart);
    door1.addEventListener('touchend', handleDoorTouchEnd);
    door2.addEventListener('click', () => handleDoorClick(door2, 2));
    resetButton.addEventListener('click', resetGame);

    // Bear icon click handler (Easter Egg)
    const bearIcon = document.querySelector('.bear-icon'); // Assuming you have a bear icon with this class
    if (bearIcon) {
        bearIcon.addEventListener('click', handleBearIconClick);
        bearIcon.addEventListener('touchstart', handleBearIconClick);
    }
    
    // Function to initialize the game
    function initGame() {
        // Randomly decide which door has the party
        partyDoor = Math.random() < 0.5 ? 1 : 2;
        
        // Reset game state
        gameActive = true;
        
        // Hide results and reset button
        winResult.classList.add('hidden');
        loseResult.classList.add('hidden');
        resetButton.classList.add('hidden');
        
        // Reset doors
        resetDoors();

        // Reset easter egg variables
        partyModeSelected = false;
        bearIconClicks = 0;
    }

    function handleBearIconClick() {
        if (partyModeSelected) {
            bearIconClicks++;
        }
    }
    
    // Function to handle door clicks
    function handleDoorClick(doorElement, doorNumber) {
        // Only proceed if the game is active
        if (!gameActive) return;

        if (doorNumber === partyDoor) {
            partyModeSelected = true;
        }
        
        // Play door creaking sound
        playSound('door_creak');
        
        // Open the door
        doorElement.classList.add('open');
        
        // Show the appropriate content behind the door
        if (doorNumber === partyDoor) {
            // Show party
            doorElement.querySelector('.door-back.party').classList.remove('hidden');
            doorElement.querySelector('.door-back.bears').classList.add('hidden');
            
            // Show win message
            setTimeout(() => {
                winResult.classList.remove('hidden');
                resetButton.classList.remove('hidden');
                playSound('win');
            }, 800);
        } else {
            // Show bears
            doorElement.querySelector('.door-back.bears').classList.remove('hidden');
            doorElement.querySelector('.door-back.party').classList.add('hidden');
            
            // Play initial bear growl
            setTimeout(() => {
                playSound('bear_growl');
            }, 300);
            
            // Play bear attack sound after a short delay
            setTimeout(() => {
                playSound('bear_attack');
            }, 1000);
            
            // Show lose message
            setTimeout(() => {
                loseResult.classList.remove('hidden');
                resetButton.classList.remove('hidden');
                playSound('bear_laugh');
            }, 1500);
        }
        
        // Open the other door to show what was behind it
        const otherDoorElement = doorNumber === 1 ? door2 : door1;
        const otherDoorNumber = doorNumber === 1 ? 2 : 1;
        
        setTimeout(() => {
            otherDoorElement.classList.add('open');
            
            if (otherDoorNumber === partyDoor) {
                otherDoorElement.querySelector('.door-back.party').classList.remove('hidden');
                otherDoorElement.querySelector('.door-back.bears').classList.add('hidden');
            } else {
                otherDoorElement.querySelector('.door-back.bears').classList.remove('hidden');
                otherDoorElement.querySelector('.door-back.party').classList.add('hidden');
            }
        }, 1200);
        
        // Game is now inactive until reset
        gameActive = false;

        // Make the headline clickable
        const headline = document.querySelector('h1');
        if (headline) {
            headline.classList.add('clickable-headline');
        }
    }
    
    // Function to reset doors
    function resetDoors() {
        // Reset door 1
        door1.classList.remove('open');
        door1.querySelector('.door-back.party').classList.add('hidden');
        door1.querySelector('.door-back.bears').classList.add('hidden');
        
        // Reset door 2
        door2.classList.remove('open');
        door2.querySelector('.door-back.party').classList.add('hidden');
        door2.querySelector('.door-back.bears').classList.add('hidden');
    }
    
    // Function to reset the game
    function resetGame() {
        initGame();
        playSound('reset');
    }

    let doorHoldTimer;

    function handleDoorTouchStart() {
        doorHoldTimer = setTimeout(() => {
            // Show the troll
            showTrollDialogue();
        }, 5000);
    }

    function handleDoorTouchEnd() {
        clearTimeout(doorHoldTimer);
    }

    function showTrollDialogue() {
        // Create the dialogue elements
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        `;

        const trollImage = document.createElement('img');
        trollImage.src = 'assets/troll.png.png';
        trollImage.alt = 'Troll';
        trollImage.style.cssText = `
            width: 200px;
            height: auto;
            margin-bottom: 10px;
        `;

        const message = document.createElement('p');
        message.textContent = 'Do you want to listen to my story?';
        message.style.marginBottom = '10px';

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Yes';
        acceptButton.style.cssText = `
            margin-right: 10px;
            padding: 5px 10px;
            border-radius: 5px;
            background-color: green;
            color: white;
            border: none;
            cursor: pointer;
        `;
        acceptButton.addEventListener('click', () => {
            // Play the story
            playTrollStory();
            modal.remove();
        });

        const declineButton = document.createElement('button');
        declineButton.textContent = 'No';
        declineButton.style.cssText = `
            padding: 5px 10px;
            border-radius: 5px;
            background-color: red;
            color: white;
            border: none;
            cursor: pointer;
        `;
        declineButton.addEventListener('click', () => {
            modal.remove();
        });

        modalContent.appendChild(trollImage);
        modalContent.appendChild(message);
        modalContent.appendChild(acceptButton);
        modalContent.appendChild(declineButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    function playTrollStory() {
        // Play the story sound
        playSound('troll_story');

        // Grant safe passage
        safePassage();
    }

    function safePassage() {
        gameActive = false;
        winResult.classList.remove('hidden');
        resetButton.classList.remove('hidden');
    }

    // Function to display the easter egg message
    function displayEasterEgg() {
        const easterEggMessage = "The bears have escaped and crashed the party!";
        // alert(easterEggMessage); // Or display in a more elegant way

        // Swap the headline text with the easter egg message
        const headline = document.querySelector('h1');
        if (headline) {
            headline.textContent = easterEggMessage;
        }

        // Play hidden sound effects
        playSound('hidden_scream_1');
        playSound('hidden_scream_2');
        playSound('hidden_roar_1');

        shakeScreen(500, 20);
    }

    function shakeScreen(duration = 500, intensity = 10) {
        const body = document.body;
        let startTime = null;

        function animateShake(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < duration) {
                const x = (Math.random() - 0.5) * intensity; // Random value between -intensity/2 and +intensity/2
                const y = (Math.random() - 0.5) * intensity;

                body.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animateShake);
            } else {
                body.style.transform = ''; // Reset transform after shake
            }
        }

        requestAnimationFrame(animateShake);
    }
    
    // Function to play sound effects
    function playSound(type) {
        console.log('playSound called with type:', type, 'audioEnabled:', audioEnabled);
        // Skip if audio is not enabled or supported
        if (!audioEnabled && type !== 'door_creak') {
            return; // Still try to play the door creak as it's the first sound
        }
        
        // Create audio element
        const audio = new Audio();
        
        // Set source based on type
        if (audioFiles[type]) {
            audio.src = audioFiles[type];
            
            // Set appropriate volume
            switch(type) {
                case 'win':
                    audio.volume = 0.7;
                    break;
                case 'door_creak':
                    audio.volume = 0.5;
                    break;
                case 'bear_growl':
                    audio.volume = 0.8;
                    break;
                case 'bear_attack':
                    audio.volume = 1.0;
                    break;
                case 'bear_laugh':
                    audio.volume = 0.9;
                    break;
                case 'reset':
                    audio.volume = 0.6;
                    break;
                case 'hidden_scream_1':
                case 'hidden_scream_2':
                case 'hidden_roar_1':
                    audio.volume = 1.0;
                    break;
                case 'knock-on-door':
                    audio.volume = 0.7;
                    break;
                default:
                    audio.volume = 0.5;
            }
            
            // Play the sound with better error handling
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Sound played successfully
                    if (!audioEnabled) {
                        audioEnabled = true; // Mark audio as enabled if it works
                    }
                }).catch(error => {
                    console.log(`Audio play failed for ${type}:`, error);
                    // Autoplay was prevented.
                    // Show a UI element to let the user manually start playback.
                    if (error.name === 'NotAllowedError') {
                        console.log('Autoplay prevented by browser.');
                    }
                });
            }
        }
    }

    // Headline click handler (Easter Egg)
    const headline = document.querySelector('h1'); // Assuming the headline is an h1 element

    let headlineClicks = 0;
    let easterEggDisplayed = false;

    if (headline) {
        headline.addEventListener('click', handleHeadlineClick);
        headline.addEventListener('touchstart', handleHeadlineClick);
    }

    function handleHeadlineClick() {
        console.log('handleHeadlineClick called');
        if (!gameActive && headline.classList.contains('clickable-headline')) {
            headlineClicks++;
            if (headlineClicks <= 2) {
                playSound('knock-on-door');
            }
            if (headlineClicks >= 3 && !easterEggDisplayed) {
                displayEasterEgg();
                easterEggDisplayed = true;
            }
        }
    }

    function displayEasterEgg() {
        console.log('displayEasterEgg called');
        const easterEggMessage = "The bears have escaped and crashed the party!";
        alert(easterEggMessage); // Or display in a more elegant way

        // Play hidden sound effects
        playSound('hidden_scream_1');
        playSound('hidden_scream_2');
        playSound('hidden_roar_1');

        shakeScreen(500, 20);
    }
});
