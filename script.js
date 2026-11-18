function generateArray() {
  const numbers = [];

  for (let i = 0; i < 20; i++) {
    const randomNumber = Math.floor(Math.random() * 91) + 10;
    numbers.push(randomNumber);
  }

  return numbers;
}

let numbers = generateArray();
let comparisonCount = 0;
let sortingRunning = false;
let stopRequested = false;

const newArrayButton = document.getElementById("new-array-button");
const sortButton = document.getElementById("sort-button");
const stopButton = document.getElementById("stop-button");
const speedSlider = document.getElementById("speed-slider");
const speedLevel = document.getElementById("speed-level");
const customInput = document.getElementById("custom-input");
const applyCustomButton = document.getElementById("apply-custom-button");
const algorithmPicker = document.getElementById("algorithm-picker");
const inputError = document.getElementById("input-error");
const comparisonCounter = document.getElementById("comparisons-counter");
const algorithmStat = document.getElementById("algorithm-stat");
const arraySizeStat = document.getElementById("array-size-stat");
const algorithmDescription = document.getElementById("algorithm-description");
const algorithmComplexity = document.getElementById("algorithm-complexity");
const sortStatus = document.getElementById("sort-status");

const algorithmInfo = {
  bubble: {
    name: "Bubble sort",
    description: "Repeatedly compares neighbors and swaps values that are in the wrong order.",
    complexity: "Best O(n) · Worst O(n²)"
  },
  selection: {
    name: "Selection sort",
    description: "Finds the smallest remaining value and places it in the next position.",
    complexity: "Best O(n²) · Worst O(n²)"
  },
  insertion: {
    name: "Insertion sort",
    description: "Builds a sorted section by inserting each value into its correct position.",
    complexity: "Best O(n) · Worst O(n²)"
  }
};

function pause(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

function getAnimationDelay() {
  const sliderValue = Number(speedSlider.value);
  return 1000 - sliderValue;
}

function updateSpeedLevel() {
  const sliderValue = Number(speedSlider.value);

  if (sliderValue < 350) {
    speedLevel.textContent = "Slow";
  } else if (sliderValue < 750) {
    speedLevel.textContent = "Medium";
  } else {
    speedLevel.textContent = "Fast";
  }
}

function updateStats() {
  const selectedInfo = algorithmInfo[algorithmPicker.value];
  algorithmStat.textContent = selectedInfo.name;
  arraySizeStat.textContent = numbers.length;
  comparisonCounter.textContent = comparisonCount;

  algorithmDescription.textContent = selectedInfo.description;
  algorithmComplexity.textContent = selectedInfo.complexity;
}

function setSortingControlsEnabled(enabled) {
  sortButton.disabled = !enabled;
  newArrayButton.disabled = !enabled;
  applyCustomButton.disabled = !enabled;
  customInput.disabled = !enabled;
  algorithmPicker.disabled = !enabled;
  stopButton.disabled = enabled;

  if (enabled) {
    sortingRunning = false;
  }
}

function renderBars(
  numbersToRender,
  firstIndex = -1,
  secondIndex = -1,
  finishedIndexes = []
) {
  const container = document.getElementById("bars-container");
  const tallestNumber = Math.max(...numbersToRender);
  const computedStyle = window.getComputedStyle(container);
  const topPadding = parseFloat(computedStyle.paddingTop);
  const bottomPadding = parseFloat(computedStyle.paddingBottom);
  const availableHeight = container.clientHeight - topPadding - bottomPadding;

  container.innerHTML = "";

  numbersToRender.forEach(function (number, index) {
    const column = document.createElement("div");
    const bar = document.createElement("div");
    const scaledHeight = tallestNumber === 0
      ? 0
      : (number / tallestNumber) * availableHeight;

    column.classList.add("bar-column");
    bar.style.height = scaledHeight + "px";
    bar.classList.add("bar");

    if (finishedIndexes.includes(index)) {
      bar.classList.add("finished");
    } else if (index === firstIndex || index === secondIndex) {
      bar.classList.add("comparing");
    }

    if (numbersToRender.length <= 20) {
      const valueLabel = document.createElement("span");
      valueLabel.classList.add("bar-value");
      valueLabel.textContent = number;
      valueLabel.style.bottom = scaledHeight + 6 + "px";
      column.appendChild(valueLabel);
    }

    column.appendChild(bar);
    container.appendChild(column);
  });
}

async function bubbleSort(array) {
  const finishedIndexes = [];

  for (let i = 0; i < array.length - 1; i++) {
    let swapped = false;

    for (let j = 0; j < array.length - 1 - i; j++) {
      comparisonCount++;
      updateStats();
      renderBars(array, j, j + 1, finishedIndexes);

      await pause(getAnimationDelay());
      if (stopRequested) {
        return array;
      }

      if (array[j] > array[j + 1]) {
        const temporaryValue = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temporaryValue;
        swapped = true;
      }

      renderBars(array, -1, -1, finishedIndexes);
    }

    finishedIndexes.push(array.length - 1 - i);
    renderBars(array, -1, -1, finishedIndexes);

    if (!swapped) {
      finishedIndexes.length = 0;
      for (let finishedIndex = 0; finishedIndex < array.length; finishedIndex++) {
        finishedIndexes.push(finishedIndex);
      }
      renderBars(array, -1, -1, finishedIndexes);
      break;
    }
  }

  finishedIndexes.push(0);
  renderBars(array, -1, -1, finishedIndexes);
  return array;
}

async function selectionSort(array) {
  const finishedIndexes = [];

  for (let i = 0; i < array.length - 1; i++) {
    let smallestIndex = i;

    for (let j = i + 1; j < array.length; j++) {
      comparisonCount++;
      updateStats();
      renderBars(array, smallestIndex, j, finishedIndexes);

      await pause(getAnimationDelay());
      if (stopRequested) {
        return array;
      }

      if (array[j] < array[smallestIndex]) {
        smallestIndex = j;
      }
    }

    const temporaryValue = array[i];
    array[i] = array[smallestIndex];
    array[smallestIndex] = temporaryValue;

    finishedIndexes.push(i);
    renderBars(array, -1, -1, finishedIndexes);
  }

  finishedIndexes.push(array.length - 1);
  renderBars(array, -1, -1, finishedIndexes);
  return array;
}

async function insertionSort(array) {
  const finishedIndexes = [];

  for (let i = 1; i < array.length; i++) {
    const currentValue = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > currentValue) {
      comparisonCount++;
      updateStats();
      renderBars(array, j, j + 1, finishedIndexes);

      await pause(getAnimationDelay());
      if (stopRequested) {
        array[j + 1] = currentValue;
        return array;
      }

      array[j + 1] = array[j];
      j--;
    }

    array[j + 1] = currentValue;
    finishedIndexes.length = 0;
    for (let finishedIndex = 0; finishedIndex <= i; finishedIndex++) {
      finishedIndexes.push(finishedIndex);
    }
    renderBars(array, -1, -1, finishedIndexes);
  }

  renderBars(array, -1, -1, finishedIndexes);
  return array;
}

speedSlider.addEventListener("input", updateSpeedLevel);

algorithmPicker.addEventListener("change", updateStats);

window.addEventListener("resize", function () {
  renderBars(numbers);
});

newArrayButton.addEventListener("click", function () {
  if (sortingRunning) {
    return;
  }

  numbers = generateArray();
  comparisonCount = 0;
  renderBars(numbers);
  updateStats();
});

applyCustomButton.addEventListener("click", function () {
  if (sortingRunning) {
    return;
  }

  const pieces = customInput.value.split(",");
  const convertedNumbers = [];

  inputError.textContent = "";

  for (let i = 0; i < pieces.length; i++) {
    const trimmedPiece = pieces[i].trim();

    if (trimmedPiece === "") {
      inputError.textContent = "Please do not leave any entries empty.";
      return;
    }

    const number = Number(trimmedPiece);

    if (!Number.isFinite(number)) {
      inputError.textContent = "Please enter numbers only.";
      return;
    }

    convertedNumbers.push(number);
  }

  if (convertedNumbers.length < 2) {
    inputError.textContent = "Please enter at least 2 numbers.";
    return;
  }

  if (convertedNumbers.length > 30) {
    inputError.textContent = "Please enter no more than 30 numbers.";
    return;
  }

  for (let i = 0; i < convertedNumbers.length; i++) {
    if (convertedNumbers[i] < 1 || convertedNumbers[i] > 1000) {
      inputError.textContent = "Each number must be between 1 and 1000.";
      return;
    }
  }

  numbers = convertedNumbers;
  comparisonCount = 0;
  renderBars(numbers);
  updateStats();
});

stopButton.addEventListener("click", function () {
  if (sortingRunning) {
    stopRequested = true;
    stopButton.disabled = true;
  }
});

sortButton.addEventListener("click", async function () {
  if (sortingRunning) {
    return;
  }

  sortingRunning = true;
  stopRequested = false;
  sortStatus.textContent = "";
  comparisonCount = 0;
  setSortingControlsEnabled(false);
  updateStats();
  renderBars(numbers);

  if (algorithmPicker.value === "bubble") {
    numbers = await bubbleSort(numbers);
  } else if (algorithmPicker.value === "selection") {
    numbers = await selectionSort(numbers);
  } else {
    numbers = await insertionSort(numbers);
  }

  if (stopRequested) {
    renderBars(numbers);
    sortStatus.textContent = "Stopped after " + comparisonCount + " comparisons";
  } else {
    sortStatus.textContent = "Sorted in " + comparisonCount + " comparisons";
  }

  setSortingControlsEnabled(true);
  stopRequested = false;
  updateStats();
});

updateSpeedLevel();
renderBars(numbers);
updateStats();
