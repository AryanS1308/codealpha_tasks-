/* ==========================================================================
   Luminary Glass Calculator Application Script
   ========================================================================== */

// --- Calculator State Variables ---
let currentInput = "0";
let previousInput = "";
let selectedOperator = null;
let shouldResetScreen = false;

// --- DOM Elements ---
const displayFormula = document.getElementById("display-formula");
const displayValue = document.getElementById("display-value");
const kbIndicator = document.getElementById("kb-indicator");
const keypad = document.getElementById("calc-keypad");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  setupClickListeners();
  setupKeyboardListeners();
  updateDisplay();
});

// --- Setup Button Clicks ---
function setupClickListeners() {
  keypad.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) return;

    const numValue = target.getAttribute("data-num");
    const opValue = target.getAttribute("data-operator");
    const actionValue = target.getAttribute("data-action");

    if (numValue !== null) {
      handleNumber(numValue);
    } else if (opValue !== null) {
      handleOperator(opValue);
    } else if (actionValue !== null) {
      handleAction(actionValue);
    }
    
    updateDisplay();
  });
}

// --- Setup Keyboard Bindings ---
function setupKeyboardListeners() {
  document.addEventListener("keydown", (e) => {
    let key = e.key;
    let buttonId = null;

    // Normalizing keys
    if (key >= "0" && key <= "9") {
      handleNumber(key);
      buttonId = `key-${key}`;
    } else if (key === ".") {
      handleNumber(".");
      buttonId = "key-decimal";
    } else if (key === "+") {
      handleOperator("+");
      buttonId = "key-add";
    } else if (key === "-") {
      handleOperator("-");
      buttonId = "key-subtract";
    } else if (key === "*" || key.toLowerCase() === "x") {
      handleOperator("*");
      buttonId = "key-multiply";
    } else if (key === "/") {
      e.preventDefault(); // Prevents quick-search bar in some browsers
      handleOperator("/");
      buttonId = "key-divide";
    } else if (key === "Enter" || key === "=") {
      e.preventDefault();
      handleAction("calculate");
      buttonId = "key-equals";
    } else if (key === "Backspace") {
      handleAction("delete");
      buttonId = "key-delete";
    } else if (key === "Escape" || key === "Delete") {
      handleAction("clear");
      buttonId = "key-clear";
    } else if (key === "%") {
      handleAction("percent");
      buttonId = "key-percent";
    }

    // Trigger visual state feedback
    if (buttonId) {
      const button = document.getElementById(buttonId);
      if (button) {
        button.classList.add("key-pressed");
        
        // Glow keyboard connectivity LED
        kbIndicator.classList.add("active");
      }
    }
    
    updateDisplay();
  });

  document.addEventListener("keyup", (e) => {
    // Remove visual state classes
    const activeKeys = document.querySelectorAll(".key.key-pressed");
    activeKeys.forEach(btn => btn.classList.remove("key-pressed"));
    
    // Turn off KB LED slightly after release
    setTimeout(() => {
      // Check if any other key is still held
      const activeKeysRemaining = document.querySelectorAll(".key.key-pressed");
      if (activeKeysRemaining.length === 0) {
        kbIndicator.classList.remove("active");
      }
    }, 150);
  });
}

// --- Logic Processors ---

function handleNumber(num) {
  if (shouldResetScreen) {
    currentInput = "";
    shouldResetScreen = false;
  }

  // Prevent multiple decimals
  if (num === "." && currentInput.includes(".")) return;

  // Prevent multiple leading zeroes
  if (currentInput === "0" && num !== ".") {
    currentInput = num;
  } else {
    currentInput += num;
  }
}

function handleOperator(op) {
  if (selectedOperator !== null && !shouldResetScreen) {
    // Perform intermediate calculation (chains inputs)
    const result = evaluateExpression();
    if (result === "Error") {
      currentInput = "Error";
      previousInput = "";
      selectedOperator = null;
      shouldResetScreen = true;
      return;
    }
    previousInput = String(result);
    currentInput = "0";
  } else {
    // Store current as previous
    if (currentInput === "Error") {
      currentInput = "0";
    }
    previousInput = currentInput;
    currentInput = "0";
  }

  selectedOperator = op;
  shouldResetScreen = false;
}

function handleAction(action) {
  switch (action) {
    case "clear":
      currentInput = "0";
      previousInput = "";
      selectedOperator = null;
      shouldResetScreen = false;
      break;
      
    case "delete":
      if (shouldResetScreen || currentInput === "Error" || currentInput === "Infinity") {
        currentInput = "0";
        shouldResetScreen = false;
      } else if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = "0";
      }
      break;
      
    case "percent":
      if (currentInput !== "Error") {
        const val = parseFloat(currentInput);
        currentInput = String(val / 100);
        shouldResetScreen = true;
      }
      break;
      
    case "toggle-sign":
      if (currentInput !== "Error" && currentInput !== "0") {
        if (currentInput.startsWith("-")) {
          currentInput = currentInput.slice(1);
        } else {
          currentInput = "-" + currentInput;
        }
      }
      break;
      
    case "calculate":
      if (selectedOperator === null) return;
      
      const res = evaluateExpression();
      if (res === "Error") {
        currentInput = "Error";
      } else {
        currentInput = String(res);
      }
      previousInput = "";
      selectedOperator = null;
      shouldResetScreen = true;
      break;
  }
}

// --- Mathematical Evaluation ---
function evaluateExpression() {
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(current)) return "Error";

  let result = 0;
  switch (selectedOperator) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "*":
      result = prev * current;
      break;
    case "/":
      if (current === 0) {
        return "Error"; // Divide by zero protection
      }
      result = prev / current;
      break;
    default:
      return "Error";
  }

  // Address Floating Point Bugs (e.g. 0.1 + 0.2)
  // Limit precision to 10 decimal digits to filter out floating artifacts,
  // then strip redundant trailing zeros using parseFloat.
  return parseFloat(result.toFixed(10));
}

// --- UI Display Renderer ---
function updateDisplay() {
  // Update Top Formula Screen
  if (selectedOperator !== null) {
    const opDisplay = getOperatorSymbol(selectedOperator);
    displayFormula.textContent = `${previousInput} ${opDisplay}`;
  } else {
    displayFormula.textContent = "";
  }

  // Update Value Screen
  displayValue.textContent = currentInput;

  // Handle display overflow text sizing dynamically
  const textLength = currentInput.length;
  if (textLength > 16) {
    displayValue.style.fontSize = "1.5rem";
  } else if (textLength > 10) {
    displayValue.style.fontSize = "1.9rem";
  } else {
    displayValue.style.fontSize = "2.6rem";
  }
}

// Helper to translate code math operators into clean screen symbols
function getOperatorSymbol(op) {
  switch (op) {
    case "/": return "÷";
    case "*": return "×";
    case "-": return "−";
    case "+": return "+";
    default: return op;
  }
}
