// Fibonacci Timer logic
let fibSequence = [1, 2, 3, 5, 8, 13, 21];
let currentFibIndex = 0;
let timerInterval;
let isTimerRunning = false;
let timeLeft = 0;
let beepInterval;

// Brown Noise logic
let audioContext;
let brownNoiseNode;
let gainNode;
let isBrownNoiseOn = false;

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft > 0) {
        timeLeft--;
    } else {
        clearInterval(timerInterval);
        startBeeping();
        showButtons();
    }
}

function startBeeping() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    beepInterval = setInterval(() => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Beep for 0.1 seconds
    }, 1000); // Beep every second
}

function stopBeeping() {
    clearInterval(beepInterval);
}

function showButtons() {
    document.getElementById('start-timer').classList.add('hidden');
    document.getElementById('grind-button').classList.remove('hidden');
    document.getElementById('restart-button').classList.remove('hidden');
}

function hideButtons() {
    document.getElementById('start-timer').classList.remove('hidden');
    document.getElementById('grind-button').classList.add('hidden');
    document.getElementById('restart-button').classList.add('hidden');
}

function startNextTimer() {
    stopBeeping();
    hideButtons();
    currentFibIndex = (currentFibIndex + 1) % fibSequence.length;
    timeLeft = fibSequence[currentFibIndex] * 60;
    timerInterval = setInterval(updateTimer, 1000);
    isTimerRunning = true;
    document.getElementById('start-timer').textContent = 'Stop Timer';
}

document.getElementById('start-timer').addEventListener('click', function() {
    if (!isTimerRunning) {
        timeLeft = fibSequence[currentFibIndex] * 60;
        timerInterval = setInterval(updateTimer, 1000);
        isTimerRunning = true;
        this.textContent = 'Stop Timer';
    } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        this.textContent = 'Start Timer';
    }
});

document.getElementById('grind-button').addEventListener('click', startNextTimer);

document.getElementById('restart-button').addEventListener('click', function() {
    stopBeeping();
    hideButtons();
    currentFibIndex = 0;
    startNextTimer();
});

// Brown Noise logic
document.getElementById('brown-noise-button').addEventListener('click', function() {
    if (!isBrownNoiseOn) {
        startBrownNoise();
        this.textContent = 'Stop Brown Noise';
        isBrownNoiseOn = true;
    } else {
        stopBrownNoise();
        this.textContent = 'Start Brown Noise';
        isBrownNoiseOn = false;
    }
});

function startBrownNoise() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    brownNoiseNode = audioContext.createBufferSource();
    gainNode = audioContext.createGain();
    const bufferSize = audioContext.sampleRate * 5; // 5 seconds buffer
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Adjust volume
    }

    brownNoiseNode.buffer = buffer;
    brownNoiseNode.loop = true;
    
    // Apply a low-pass filter for a lower pitch
    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(400, audioContext.currentTime);
    
    // Set a lower volume
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    brownNoiseNode.connect(lowPassFilter);
    lowPassFilter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    brownNoiseNode.start();
}

function stopBrownNoise() {
    if (brownNoiseNode) {
        brownNoiseNode.stop();
        brownNoiseNode.disconnect();
    }
    if (gainNode) {
        gainNode.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
}

// Todo list logic
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const mainTodo = document.getElementById('main-todo');

let todos = [];

todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const todoText = todoInput.value.trim();
    if (todoText) {
        addTodo(todoText);
        todoInput.value = '';
        updateTodoList();
    }
});

function addTodo(text) {
    todos.push({ text, completed: false });
}

function updateTodoList() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');
        todoItem.innerHTML = `
            <input type="checkbox" id="todo-${index}" ${todo.completed ? 'checked' : ''}>
            <label for="todo-${index}">${todo.text}</label>
            <button onclick="removeTodo(${index})">Remove</button>
        `;
        todoList.appendChild(todoItem);
    });
    updateMainTodo();
}

function updateMainTodo() {
    const incompleteTodos = todos.filter(todo => !todo.completed);
    if (incompleteTodos.length > 0) {
        mainTodo.textContent = incompleteTodos[0].text;
    } else {
        mainTodo.textContent = 'All todos completed!';
    }
}

function removeTodo(index) {
    todos.splice(index, 1);
    updateTodoList();
}

todoList.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        const index = parseInt(e.target.id.split('-')[1]);
        todos[index].completed = e.target.checked;
        updateTodoList();
    }
});

// Help dialog logic
const helpIcon = document.getElementById('help-icon');
const helpDialog = document.getElementById('help-dialog');
const closeHelp = document.getElementById('close-help');

helpIcon.addEventListener('click', function() {
    helpDialog.style.display = 'block';
});

closeHelp.addEventListener('click', function() {
    helpDialog.style.display = 'none';
});

// Close help dialog when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target == helpDialog) {
        helpDialog.style.display = 'none';
    }
});