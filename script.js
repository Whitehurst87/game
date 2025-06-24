document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const door1 = document.getElementById('door1');
    const door2 = document.getElementById('door2');
    const winResult = document.getElementById('win-result');
    const loseResult = document.getElementById('lose-result');
    const resetButton = document.getElementById('reset-button');
    const gameArea = document.querySelector('.game-area');
    const instructions = document.querySelector('.instructions');

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
    }, {
        once: true
    });

    // Initialize the game
    initGame();

    // Event listeners
    door1.addEventListener('click', () => handleDoorClick(door1, 1));
    door2.addEventListener('click', () => handleDoorClick(door2, 2));
    resetButton.addEventListener('click', resetGame);

    // Check if the user is on a mobile device
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Add touch event listeners for mobile
        door1.addEventListener('touchstart', handleDoorTouchStart);
        door1.addEventListener('touchend', handleDoorTouchEnd);
    }

    let doorHoldTimer;

    function handleDoorTouchStart() {
        doorHoldTimer = setTimeout(() => {
            // Show the troll
            showTrollDialogue();
        }, 3000);
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
            background-color: rgba(0, 0, 0, 0.5);
            padding: 20px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
            color: white;
        `;

        const trollImage = document.createElement('img');
        trollImage.src = 'assets/troll.png.png';
        trollImage.alt = 'Troll';
        trollImage.style.cssText = `
            width: 200px;
            height: auto;
            margin-bottom: 10px;
        `;

        const trollDialogue = [
            "Oi, you! Wanna hear a story?",
            "Psst, hey kid, wanna hear about the time I wrestled a bear?",
            "I've got a tale that'll curl your toes! Interested?",
            "Listen up, I've got a story that's better than free gold!",
            "Hey, you! Stop right there and listen to my story!"
        ];

        const message = document.createElement('p');
        message.textContent = trollDialogue[Math.floor(Math.random() * trollDialogue.length)];
        message.style.marginBottom = '10px';
        message.style.color = '#e0e0e0';

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Yes, tell me more!';
        acceptButton.style.cssText = `
            margin-right: 10px;
            padding: 12px 25px;
            background: linear-gradient(145deg, #4a69bd, #6a89cc);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            font-family: 'Poppins', sans-serif;
        `;
        acceptButton.addEventListener('click', () => {
            // Play the story
            playTrollStory();
            modal.remove();
        });

        const declineButton = document.createElement('button');
        declineButton.textContent = 'No';
        declineButton.style.cssText = `
            padding: 12px 25px;
            background: linear-gradient(145deg, #4a69bd, #6a89cc);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            font-family: 'Poppins', sans-serif;
        `;
        declineButton.addEventListener('click', () => {
            modal.remove();

            // Play the easter egg video
            const video = document.createElement('video');
            video.src = 'assets/troll_video.mp4';
            video.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 1001;
                background-color: black;
            `;
            video.autoplay = true;
            video.muted = false; // Ensure the video is not muted
            document.body.appendChild(video);

            // Remove the video after it finishes playing
            video.addEventListener('ended', () => {
                video.remove();
            });
        });

        modalContent.appendChild(trollImage);
        modalContent.appendChild(message);
        modalContent.appendChild(acceptButton);
        modalContent.appendChild(declineButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    function playTrollStory() {
        // Hide the game area
        gameArea.style.display = 'none';
        instructions.style.display = 'none';

        // Create video element
        const video = document.createElement('video');
        video.src = 'assets/troll_video.mp4';
        video.style.cssText = `
            position: fixed;
            top: 10%;
            left: 5%;
            width: 90%;
            height: 60%;
            object-fit: contain;
            z-index: 1001;
            background-color: black;
        `;
        video.autoplay = true;
        video.controls = false; // Hide default controls
        document.body.appendChild(video);

        // Create progress bar
        const progressBar = document.createElement('progress');
        progressBar.style.cssText = `
            position: fixed;
            top: 70%;
            left: 5%;
            width: 90%;
            height: 20px;
            z-index: 1002;
        `;
        progressBar.value = 0;
        progressBar.max = 100;
        document.body.appendChild(progressBar);

        // Update progress bar
        video.addEventListener('timeupdate', () => {
            progressBar.value = (video.currentTime / video.duration) * 100;
        });

        // Remove video and progress bar when finished
        video.addEventListener('ended', () => {
            video.remove();
            progressBar.remove();

            // Show the game area
            gameArea.style.display = 'flex';
            instructions.style.display = 'block';

            // Grant safe passage
            safePassage();
        });
    }

    function safePassage() {
        gameActive = false;
        winResult.classList.remove('hidden');
        resetButton.classList.remove('hidden');
        winResult.classList.add('graffiti');
        playSound('win');

        // Add humorous message
        const trollMessage = document.createElement('p');
        trollMessage.textContent = "Thanks for bearing with the troll and his wacky stories!";
        trollMessage.style.cssText = `
            font-size: 1.2rem;
            margin-top: 20px;
            color: #e0e0e0;
        `;
        gameArea.appendChild(trollMessage);
    }

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
            switch (type) {
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
