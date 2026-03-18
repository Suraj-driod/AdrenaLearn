export const getQuestionsByTopic = (topicStr) => {
  // Normalize topic string
  const topic = topicStr ? topicStr.toLowerCase().trim().replace(/\s+/g, '-') : 'variables';

  const allTopics = {
    'variables': [
      "Create a variable called 'name' and assign it the value 'Python'",
      "Create an integer variable 'age' with the value 25",
      "Create a boolean variable 'is_active' and set it to True",
      "Create a float variable 'price' with the value 19.99",
      "Assign the value 'Alice' to variable p1"
    ],
    'control-flow': [
      "Write an if statement comparing if 'x' is greater than 10",
      "Write an if-else block checking if 'age' >= 18 to print 'Adult'",
      "Write a conditional expression checking if 'score' > 90 to print 'A'",
      "Write a block of code checking if 'is_raining' is True to print 'Umbrella'",
      "Write an if-elif-else block to check if 'n' > 0, 'n' < 0, or 'n' == 0"
    ],
    'loops': [
      "Write a for loop that iterates 5 times, printing 'Hello'",
      "Write a while loop that prints numbers 1 to 5",
      "Write a for loop to iterate over characters in the string 'Python'",
      "Write a while loop that runs as long as 'count' < 10",
      "Write a for loop using range(3) that prints the index"
    ],
    'functions-and-modules': [
      "Define a function 'greet' that takes a parameter 'name' and returns 'Hello ' + name",
      "Define a function 'add' taking 'a' and 'b' and returning their sum",
      "Import the 'math' module and print math.pi",
      "Define a function 'is_even' that returns True if 'n' is even",
      "Import the 'random' module and call random.randint(1, 10)"
    ],
    'list-and-dictionaries': [
      "Create a list 'fruits' with 'apple', 'banana', 'cherry'",
      "Create a dictionary 'person' with keys 'name' and 'age'",
      "Write code to append 'orange' to the list 'fruits'",
      "Write code to get the value of 'age' from the dictionary 'person'",
      "Create a list of numbers from 1 to 5 named 'nums'"
    ]
  };

  // Safe fallback to variables if topic isn't found
  return allTopics[topic] || allTopics['variables'];
};

export const getRandomQuestion = (topicStr) => {
  const questions = getQuestionsByTopic(topicStr);
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};

export const getEmergencyMCQ = (topicStr) => {
  const topic = topicStr ? topicStr.toLowerCase().trim().replace(/\s+/g, '-') : 'variables';
  
  const mcqs = {
    'variables': {
      question: "Which keyword declares a variable that cannot be reassigned?",
      options: ["const", "let", "var"],
      correct: "const"
    },
    'control-flow': {
      question: "Which statement is used to execute code if a condition is true?",
      options: ["if", "for", "while"],
      correct: "if"
    },
    'loops': {
      question: "Which loop is guaranteed to iterate based on an iterable's length?",
      options: ["for", "while", "do-while"],
      correct: "for"
    },
    'functions-and-modules': {
      question: "What keyword is used to define a function in Python?",
      options: ["def", "function", "fn"],
      correct: "def"
    },
    'list-and-dictionaries': {
      question: "Which symbol is used to create a list in Python?",
      options: ["[]", "{}", "()"],
      correct: "[]"
    }
  };
  
  return mcqs[topic] || mcqs['variables'];
};

export const getTriviaByTopic = (topicStr) => {
  const topic = topicStr ? topicStr.toLowerCase().trim().replace(/\s+/g, '-') : 'variables';
  
  const trivias = {
    'variables': [
      "Variables are containers for data.",
      "Const values cannot be changed.",
      "Variable names should be descriptive.",
      "Modern JS uses let and const."
    ],
    'control-flow': [
      "If statements allow branching logic.",
      "Elif chains multiple conditions.",
      "Else handles the fallback case.",
      "Indentation matters in Python blocks."
    ],
    'loops': [
      "For loops iterate over sequences.",
      "While loops run until false.",
      "Break exits a loop early.",
      "Continue skips to the next iteration."
    ],
    'functions-and-modules': [
      "Functions make code reusable.",
      "Modules organize related functions.",
      "Return statements pass data back.",
      "Variables in functions are local."
    ],
    'list-and-dictionaries': [
      "Lists maintain insertion order.",
      "Dictionaries store key-value pairs.",
      "List indices start at zero.",
      "Dict keys must be immutable."
    ]
  };
  
  return trivias[topic] || trivias['variables'];
};
