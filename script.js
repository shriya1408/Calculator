 // Get references to the display and calculator buttons container
        const display = document.getElementById('display');
        const calculator = document.querySelector('.calculator-buttons');

        // State variables for the calculator logic
        let currentInput = '0'; // Stores the current number being typed or displayed
        let previousInput = ''; // Stores the first operand of an operation
        let operator = null;    // Stores the current operator (+, -, *, /)
        let waitingForSecondOperand = false; // Flag to indicate if the next input is the second operand

        /**
         * Formats a number for display, removing trailing .0 if it's an integer.
         * @param {number} num - The number to format.
         * @returns {string} The formatted number string.
         */
        function formatNumberForDisplay(num) {
            // Using parseFloat and then String() naturally handles .0 for integers
            // e.g., parseFloat('5.0') -> 5, String(5) -> '5'
            // For very large numbers or precision issues, toFixed might be needed,
            // but for a basic calculator, this should suffice.
            return String(num);
        }

        /**
         * Updates the calculator display with the current input or the full equation.
         */
        function updateDisplay() {
            let displayString = '';
            // Convert internal operator symbols to display symbols
            const displayOperator = operator === '/' ? '÷' : (operator === '*' ? '×' : operator);

            if (operator === null && previousInput === '') {
                // Initial state or after clear/final calculation
                displayString = formatNumberForDisplay(parseFloat(currentInput));
            } else if (waitingForSecondOperand) {
                // After an operator is pressed, show the first operand and the operator
                displayString = `${formatNumberForDisplay(previousInput)} ${displayOperator}`;
            } else {
                // While typing the second operand, show the full equation
                displayString = `${formatNumberForDisplay(previousInput)} ${displayOperator} ${formatNumberForDisplay(parseFloat(currentInput))}`;
            }
            display.textContent = displayString;
        }

        /**
         * Handles digit button clicks.
         * Appends the digit to the current input or starts a new input if waiting for a second operand.
         * @param {string} digit - The digit pressed (e.g., '7', '0').
         */
        function inputDigit(digit) {
            if (waitingForSecondOperand) {
                currentInput = digit; // Start new input for the second operand
                waitingForSecondOperand = false;
            } else {
                // If current input is '0' and the new digit is not '.', replace '0'; otherwise, append.
                currentInput = (currentInput === '0' && digit !== '.') ? digit : currentInput + digit;
            }
            updateDisplay();
        }

        /**
         * Handles decimal point button clicks.
         * Adds a decimal point if one doesn't already exist in the current input.
         */
        function inputDecimal() {
            if (waitingForSecondOperand) {
                currentInput = '0.'; // If waiting for second operand, start with '0.'
                waitingForSecondOperand = false;
                updateDisplay();
                return;
            }
            // Only add a decimal if one doesn't already exist
            if (!currentInput.includes('.')) {
                currentInput += '.';
            }
            updateDisplay();
        }

        /**
         * Resets the calculator to its initial state.
         */
        function clearAll() {
            currentInput = '0';
            previousInput = '';
            operator = null;
            waitingForSecondOperand = false;
            updateDisplay();
        }

        /**
         * Handles the backspace (DEL) operation.
         * Removes the last character from the current input. If only one character or '0', sets to '0'.
         */
        function backspace() {
            if (waitingForSecondOperand) {
                // If an operator was just pressed and no second number typed, backspace should clear the operator
                // or revert to the previous state. For simplicity, we'll clear current input to '0'.
                currentInput = '0';
                waitingForSecondOperand = false; // Allow new input
            } else if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }

        /**
         * Handles operator button clicks.
         * Stores the first operand and the operator, then sets the flag to wait for the second operand.
         * @param {string} nextOperator - The operator pressed (e.g., '+', '-', '×', '÷').
         */
        function handleOperator(nextOperator) {
            const inputValue = parseFloat(currentInput);

            // If an operator is already set and waiting for a second operand,
            // allow changing the operator without calculating.
            if (operator && waitingForSecondOperand) {
                operator = nextOperator;
                updateDisplay(); // Update display to show the new operator
                return;
            }

            // If previousInput is null, this is the first operand.
            if (previousInput === '') {
                previousInput = inputValue;
            } else if (operator) {
                // If there's a previous operand and an operator, calculate the result
                // before setting the new operator.
                const result = operate(previousInput, inputValue, operator);
                currentInput = String(result); // Store result in currentInput temporarily
                previousInput = result; // Set result as the new previous input for chaining operations
            }

            operator = nextOperator;
            waitingForSecondOperand = true; // Next digit input will be the second operand
            updateDisplay();
        }

        /**
         * Performs the actual mathematical operation.
         * @param {number} num1 - The first number.
         * @param {number} num2 - The second number.
         * @param {string} op - The operator.
         * @returns {number | string} The result of the operation or an error message.
         */
        function operate(num1, num2, op) {
            let result;
            switch (op) {
                case '+':
                    result = num1 + num2;
                    break;
                case '-':
                    result = num1 - num2;
                    break;
                case '*':
                    result = num1 * num2;
                    break;
                case '/':
                    if (num2 === 0) {
                        return 'Error: Div by 0'; // Handle division by zero
                    }
                    result = num1 / num2;
                    break;
                case '%':
                    // This often means (current number / 100) if no operator
                    // or (num1 * (num2 / 100)) if operator active
                    if (previousInput === '') { // If no previous input, acts as a percentage of itself
                        result = num1 / 100;
                    } else { // If there's a previous input, it's num1 % of num2 (or num1 * (num2 / 100))
                        // The Google calculator usually treats X % as X * 0.01 if it's the first number,
                        // or for "A + B %", it's A + (A * B / 100)
                        // For simplicity and to match the previous behavior, we'll keep it as previous * (current / 100)
                        result = num1 * (num2 / 100);
                    }
                    break;
                default:
                    return num2; // Should not happen
            }
            // Ensure numbers are formatted as clean strings, removing unnecessary trailing zeros.
            return parseFloat(result.toPrecision(12)); // Use toPrecision to handle floating point inaccuracies before converting
        }

        /**
         * Handles the equals button click.
         * Performs the final calculation and displays the result.
         */
        function calculateResult() {
            const inputValue = parseFloat(currentInput);

            if (operator && previousInput !== '') {
                const result = operate(previousInput, inputValue, operator);
                currentInput = String(result); // Result becomes the new currentInput
                previousInput = ''; // Reset for next calculation
                operator = null;    // Reset operator
                waitingForSecondOperand = false;
            }
            updateDisplay();
        }

        // Event listener for all calculator button clicks
        calculator.addEventListener('click', (event) => {
            const { target } = event; // Get the clicked button element

            // If the clicked element is not a button, do nothing
            if (!target.matches('button')) {
                return;
            }

            // Determine the action based on data-action or data-value attributes
            if (target.dataset.action === 'clear') {
                clearAll();
            } else if (target.dataset.action === 'backspace') {
                backspace();
            } else if (target.dataset.action === 'decimal') {
                inputDecimal();
            } else if (target.dataset.action === 'calculate') {
                calculateResult();
            } else if (target.dataset.action === 'percent') {
                // Apply percentage based on whether an operator is active
                if (operator && previousInput !== '') {
                    const inputValue = parseFloat(currentInput);
                    const result = operate(parseFloat(previousInput), inputValue, operator);
                    currentInput = String(result * (inputValue / 100)); // A + B% = A + (A * B / 100)
                    previousInput = '';
                    operator = null;
                    waitingForSecondOperand = false;
                } else {
                    currentInput = String(parseFloat(currentInput) / 100);
                }
                updateDisplay();

            } else if (target.classList.contains('operator')) {
                // If an operator button is clicked
                const operatorText = target.textContent;
                // Replace '÷' and '×' with standard symbols for calculation
                const calculatedOperator = operatorText === '÷' ? '/' : (operatorText === '×' ? '*' : operatorText);
                handleOperator(calculatedOperator);
            } else {
                // If a number button is clicked
                inputDigit(target.dataset.value);
            }
        });

        // Initialize display on load
        updateDisplay();