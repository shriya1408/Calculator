let display = document.getElementById('display');
let historyList = document.getElementById('history-list');
let clickSound = new Audio('click.mp3'); // Add your own sound file

function playClick() {
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

function appendValue(val) {
  playClick();
  display.value += val;
}

function clearDisplay() {
  playClick();
  display.value = '';
}

function calculateResult() {
  playClick();
  try {
    const expression = display.value;
    const result = eval(expression);
    display.value = result;
    if (expression !== '') {
      addToHistory(`${expression} = ${result}`);
    }
  } catch {
    display.value = 'Error';
  }
}

function addToHistory(entry) {
  const li = document.createElement('li');
  li.textContent = entry;
  historyList.prepend(li);
}

document.addEventListener('keydown', function (event) {
  const key = event.key;

  if (!isNaN(key) || "+-*/.".includes(key)) {
    appendValue(key);
  } else if (key === "Enter") {
    calculateResult();
  } else if (key === "Backspace") {
    display.value = display.value.slice(0, -1);
  } else if (key.toLowerCase() === 'c') {
    clearDisplay();
  }
});

document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const icon = document.getElementById('toggle-theme');
  icon.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});
