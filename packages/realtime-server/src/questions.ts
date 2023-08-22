export type Question = {
  text: string;
  answers: Record<string, string>;
  correctAnswer: string;
  category: string;
  explanation: string;
};

const questions: Record<string, Question> = {
  q1: {
    text: 'Which of the following U.S. States contains the furthest east land?',
    correctAnswer: 'a',
    category: 'geography',
    explanation:
      'Semisopochnoi Island in Alaska is furthest East since it crosses the International Date Line.',
    answers: {
      a: 'Alaska',
      b: 'Maine',
      c: 'Florida',
      d: 'New York',
    },
  },
  q2: {
    text: 'Which of the following U.S. States contains the furthest east land??',
    correctAnswer: 'a',
    category: 'geography',
    explanation:
      'Semisopochnoi Island in Alaska is furthest East since it crosses the International Date Line.',
    answers: {
      a: 'Alaska!',
      b: 'Maine!',
      c: 'Florida!',
      d: 'New York!',
    },
  },
  q3: {
    text: 'Which of the following U.S. States contains the furthest east land???',
    correctAnswer: 'a',
    category: 'geography',
    explanation:
      'Semisopochnoi Island in Alaska is furthest East since it crosses the International Date Line.',
    answers: {
      a: 'Alaska!!',
      b: 'Maine!!',
      c: 'Florida!!',
      d: 'New York!!',
    },
  },
};

export default questions;
