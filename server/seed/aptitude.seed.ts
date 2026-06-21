import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/question.model.js';

dotenv.config({ override: true });

interface SeedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  hint: string;
}

const questions: SeedQuestion[] = [
  // === QUANTITATIVE APTITUDE ===
  {
    questionText: 'A train 150 m long passes a pole in 15 seconds. What is the speed of the train in km/h?',
    options: ['30 km/h', '36 km/h', '40 km/h', '45 km/h'],
    correctAnswer: '36 km/h',
    difficulty: 'easy',
    category: 'Quantitative',
    hint: 'Speed = Distance / Time. Convert m/s to km/h by multiplying by 18/5.',
  },
  {
    questionText: 'If 15 men can build a wall in 8 days, how many days will 10 men take to build the same wall?',
    options: ['10 days', '12 days', '14 days', '16 days'],
    correctAnswer: '12 days',
    difficulty: 'easy',
    category: 'Quantitative',
    hint: 'Use inverse proportion: Men × Days = Constant.',
  },
  {
    questionText: 'What is the compound interest on ₹5000 at 10% per annum for 2 years?',
    options: ['₹1000', '₹1050', '₹1100', '₹1150'],
    correctAnswer: '₹1050',
    difficulty: 'medium',
    category: 'Quantitative',
    hint: 'CI = P(1 + R/100)^T - P. First find amount, then subtract principal.',
  },
  {
    questionText: 'A shopkeeper sells an item at 20% profit. If he had bought it at 10% less and sold it at ₹30 more, he would have gained 25%. Find the cost price.',
    options: ['₹400', '₹500', '₹600', '₹800'],
    correctAnswer: '₹500',
    difficulty: 'hard',
    category: 'Quantitative',
    hint: 'Let CP = x. First SP = 1.2x. New CP = 0.9x. New SP = 1.2x + 30. Profit = New SP - New CP = 25% of New CP.',
  },
  {
    questionText: 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What is the excluded number?',
    options: ['30', '35', '32', '28'],
    correctAnswer: '35',
    difficulty: 'easy',
    category: 'Quantitative',
    hint: 'Sum of 5 numbers = 5 × 27. Sum of 4 numbers = 4 × 25. Excluded number = difference.',
  },
  {
    questionText: 'A boat takes 6 hours to travel 24 km upstream and 4 hours to travel same distance downstream. Find the speed of boat in still water.',
    options: ['4 km/h', '5 km/h', '6 km/h', '8 km/h'],
    correctAnswer: '5 km/h',
    difficulty: 'medium',
    category: 'Quantitative',
    hint: 'Upstream speed = 24/6 = 4 km/h. Downstream speed = 24/4 = 6 km/h. Speed in still water = (Up + Down) / 2.',
  },
  {
    questionText: 'If x + 1/x = 4, what is the value of x² + 1/x²?',
    options: ['12', '14', '16', '18'],
    correctAnswer: '14',
    difficulty: 'medium',
    category: 'Quantitative',
    hint: 'Square both sides: (x + 1/x)² = x² + 2 + 1/x². Then solve for x² + 1/x².',
  },
  {
    questionText: 'In how many ways can 6 people be seated in a row?',
    options: ['120', '360', '480', '720'],
    correctAnswer: '720',
    difficulty: 'easy',
    category: 'Quantitative',
    hint: 'This is a permutation of 6 distinct items: 6! = 6 × 5 × 4 × 3 × 2 × 1.',
  },
  {
    questionText: 'A bag contains 4 red, 5 blue, and 6 green balls. One ball is drawn at random. What is the probability it is blue?',
    options: ['1/3', '4/15', '1/5', '5/15'],
    correctAnswer: '1/3',
    difficulty: 'easy',
    category: 'Quantitative',
    hint: 'Probability = Favorable outcomes / Total outcomes = 5 / (4 + 5 + 6).',
  },
  {
    questionText: 'If the price of sugar increases by 20%, by what percentage should consumption be reduced to keep expenditure constant?',
    options: ['16.67%', '20%', '25%', '33.33%'],
    correctAnswer: '16.67%',
    difficulty: 'medium',
    category: 'Quantitative',
    hint: 'Reduction % = (Increase % / (100 + Increase %)) × 100%.',
  },
  {
    questionText: 'Two dice are rolled. What is the probability of getting a sum of 7?',
    options: ['1/6', '1/9', '5/36', '1/12'],
    correctAnswer: '1/6',
    difficulty: 'medium',
    category: 'Quantitative',
    hint: 'Favorable pairs: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 out of 36 total outcomes.',
  },
  {
    questionText: 'The ratio of ages of A and B is 3:5. After 6 years, the ratio becomes 5:7. What is A\'s current age?',
    options: ['9 years', '12 years', '15 years', '18 years'],
    correctAnswer: '9 years',
    difficulty: 'medium',
    category: 'Quantitative',
    hint: 'Let A = 3x, B = 5x. After 6 years: (3x + 6) / (5x + 6) = 5/7. Cross multiply and solve for x.',
  },
  // === LOGICAL REASONING ===
  {
    questionText: 'What comes next in the series: 2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    correctAnswer: '42',
    difficulty: 'easy',
    category: 'Logical Reasoning',
    hint: 'Look at the differences between consecutive terms: 4, 6, 8, 10... The next difference is 12.',
  },
  {
    questionText: 'If all Blips are Blops and some Blops are Blaps, which statement must be true?',
    options: [
      'All Blips are Blaps',
      'Some Blaps are Blips',
      'No Blip is a Blap',
      'Some Blips may be Blaps',
    ],
    correctAnswer: 'Some Blips may be Blaps',
    difficulty: 'medium',
    category: 'Logical Reasoning',
    hint: 'Draw a Venn diagram. Blips are a subset of Blops. Blaps overlap with Blops but may not overlap with Blips.',
  },
  {
    questionText: 'A man walks 5 km east, turns right and walks 3 km, turns right and walks 5 km, then turns left and walks 2 km. How far is he from the starting point?',
    options: ['3 km', '4 km', '5 km', '6 km'],
    correctAnswer: '5 km',
    difficulty: 'medium',
    category: 'Logical Reasoning',
    hint: 'Plot the path: Start (0,0) → East to (5,0) → South to (5,-3) → West to (0,-3) → South to (0,-5). Distance = 5 km.',
  },
  {
    questionText: 'Find the odd one out: 121, 144, 169, 196, 225, 256',
    options: ['144', '169', '225', '256'],
    correctAnswer: '256',
    difficulty: 'hard',
    category: 'Logical Reasoning',
    hint: 'These are all perfect squares: 11², 12², 13², 14², 15². 256 = 16², but the pattern is consecutive squares starting from 11.',
  },
  {
    questionText: 'If in a certain language, "NATURE" is coded as "MZSTQD", how is "HUMAN" coded?',
    options: ['GTLZM', 'ITNBO', 'GTMZM', 'GVKZM'],
    correctAnswer: 'GTLZM',
    difficulty: 'medium',
    category: 'Logical Reasoning',
    hint: 'Each letter is replaced by the previous letter in the alphabet (N→M, A→Z, T→S, U→T, R→Q, E→D).',
  },
  {
    questionText: 'Statement: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly. Is this conclusion valid?',
    options: [
      'Yes, definitely',
      'No, not necessarily',
      'Cannot be determined',
      'None of the above',
    ],
    correctAnswer: 'No, not necessarily',
    difficulty: 'easy',
    category: 'Logical Reasoning',
    hint: 'Roses are a subset of flowers. The "some flowers" that fade quickly may not include roses.',
  },
  {
    questionText: 'If "FISH" is coded as "EHRG", then "BIRD" is coded as:',
    options: ['AHQC', 'CHSE', 'AHPC', 'BJSE'],
    correctAnswer: 'AHQC',
    difficulty: 'medium',
    category: 'Logical Reasoning',
    hint: 'Each letter is replaced by the previous letter in the alphabet (F→E, I→H, S→R, H→G).',
  },
  {
    questionText: 'What is the next number: 1, 4, 9, 16, 25, ?',
    options: ['30', '35', '36', '40'],
    correctAnswer: '36',
    difficulty: 'easy',
    category: 'Logical Reasoning',
    hint: 'These are perfect squares: 1², 2², 3², 4², 5²... The next is 6² = 36.',
  },
  {
    questionText: 'In a code language, "APPLE" is written as "BQQMF". How is "MANGO" written?',
    options: ['NBOHP', 'NBPHP', 'NBNHP', 'MBNHP'],
    correctAnswer: 'NBOHP',
    difficulty: 'medium',
    category: 'Logical Reasoning',
    hint: 'Each letter is shifted forward by 1 position in the alphabet (A→B, P→Q, P→Q, L→M, E→F).',
  },
  // === VERBAL ABILITY ===
  {
    questionText: 'Select the synonym of "UBIQUITOUS"',
    options: ['Rare', 'Scarce', 'Omnipresent', 'Limited'],
    correctAnswer: 'Omnipresent',
    difficulty: 'medium',
    category: 'Verbal',
    hint: 'The word means "found everywhere". Think of "ubiquity" as being everywhere at once.',
  },
  {
    questionText: 'Choose the correctly spelled word:',
    options: ['Accomodate', 'Acommodate', 'Accommodate', 'Acomodate'],
    correctAnswer: 'Accommodate',
    difficulty: 'easy',
    category: 'Verbal',
    hint: 'Double c, double m. Think: AC-COM-MO-DATE.',
  },
  {
    questionText: 'Fill in the blank: The manager\'s ____ speech motivated the entire team to achieve the target.',
    options: ['Lackluster', 'Banal', 'Inspirational', 'Tedious'],
    correctAnswer: 'Inspirational',
    difficulty: 'easy',
    category: 'Verbal',
    hint: 'A speech that motivates people would be inspiring or uplifting.',
  },
  {
    questionText: 'Select the antonym of "EPHEMERAL"',
    options: ['Fleeting', 'Eternal', 'Transient', 'Momentary'],
    correctAnswer: 'Eternal',
    difficulty: 'medium',
    category: 'Verbal',
    hint: 'Ephemeral means lasting for a very short time. The opposite would be lasting forever.',
  },
  {
    questionText: 'Identify the error: "Neither the teacher nor the students was aware of the change in schedule."',
    options: [
      'Neither the teacher',
      'nor the students',
      'was aware',
      'No error',
    ],
    correctAnswer: 'was aware',
    difficulty: 'hard',
    category: 'Verbal',
    hint: 'With "neither...nor", the verb agrees with the subject closest to it. "Students" is plural, so use "were" instead of "was".',
  },
  {
    questionText: 'Choose the correct article: "He is _____ honest man."',
    options: ['a', 'an', 'the', 'no article'],
    correctAnswer: 'an',
    difficulty: 'easy',
    category: 'Verbal',
    hint: 'The word "honest" starts with a silent "h", so the vowel sound requires the article "an".',
  },
  // === DATA INTERPRETATION ===
  {
    questionText: 'A pie chart shows expenses: Food 30%, Rent 25%, Transport 15%, Education 20%, Savings 10%. If total income is ₹60,000, how much is spent on Rent?',
    options: ['₹12,000', '₹15,000', '₹18,000', '₹20,000'],
    correctAnswer: '₹15,000',
    difficulty: 'easy',
    category: 'Data Interpretation',
    hint: 'Rent is 25% of total income. 25% of ₹60,000 = (25/100) × 60,000.',
  },
  {
    questionText: 'A company\'s profit (in lakhs) for years 2018-2022 is: 12, 18, 15, 22, 20. What is the percentage increase from 2018 to 2022?',
    options: ['50%', '60%', '66.67%', '75%'],
    correctAnswer: '66.67%',
    difficulty: 'medium',
    category: 'Data Interpretation',
    hint: 'Percentage increase = ((Final - Initial) / Initial) × 100% = ((20 - 12) / 12) × 100%.',
  },
  {
    questionText: 'A table shows marks of 5 students in 3 subjects. Student A: 85, 90, 78. Student B: 72, 88, 95. Student C: 90, 85, 80. Student D: 78, 82, 88. Student E: 95, 70, 85. Who has the highest average?',
    options: ['Student A', 'Student B', 'Student C', 'Student E'],
    correctAnswer: 'Student A',
    difficulty: 'medium',
    category: 'Data Interpretation',
    hint: 'Calculate each average: A = (85+90+78)/3 = 84.3, B = (72+88+95)/3 = 85, C = (90+85+80)/3 = 85, E = (95+70+85)/3 = 83.3.',
  },
  {
    questionText: 'A bar graph shows quarterly sales (in thousands): Q1=40, Q2=55, Q3=45, Q4=70. What is the ratio of Q1 sales to Q4 sales?',
    options: ['4:5', '5:7', '4:7', '8:13'],
    correctAnswer: '4:7',
    difficulty: 'easy',
    category: 'Data Interpretation',
    hint: 'Ratio = 40:70. Simplify by dividing both numbers by 10, giving 4:7.',
  },
  {
    questionText: 'A line graph shows temperature at different times: 6am=15°C, 9am=22°C, 12pm=30°C, 3pm=32°C, 6pm=25°C. What is the average temperature?',
    options: ['24.2°C', '24.8°C', '25.2°C', '25.6°C'],
    correctAnswer: '24.8°C',
    difficulty: 'medium',
    category: 'Data Interpretation',
    hint: 'Average = Sum of all values / Number of values = (15 + 22 + 30 + 32 + 25) / 5.',
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} questions. Clearing and reseeding...`);
      await Question.deleteMany({});
    }

    await Question.insertMany(questions);
    console.log(`Successfully seeded ${questions.length} questions`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seed();
