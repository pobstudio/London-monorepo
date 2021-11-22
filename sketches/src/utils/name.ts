import seedrandom from 'seedrandom';
import { ALPHABET_SOUP } from './alphabet';

/**
 * Code forked and derived from: https://github.com/craftykate/ikea-name-generator/blob/master/src/Components/NameGenerator/NameGenerator.js
 */
export const generateName = (seed: string) => {
  const randSrc = seedrandom(seed);
  let numConsonants = 0;
  let numVowels = 0;
  // Pick random word length between 3 and 9 characters
  const wordLength = Math.floor(randSrc() * 6) + 3;
  let word = '';

  // Get any letter from alphabet
  const grabAnyLetter = () => {
    let grabAlphabet = ALPHABET_SOUP.wholeAlphabet();
    return grabAlphabet[Math.floor(randSrc() * grabAlphabet.length)];
  };
  // Get just a vowel
  const grabAVowel = () => {
    let grabAlphabet = ALPHABET_SOUP.justVowels();
    return grabAlphabet[Math.floor(randSrc() * grabAlphabet.length)];
  };
  // Get just a consonant
  const grabAConsonant = () => {
    let grabAlphabet = ALPHABET_SOUP.justConsonants();
    return grabAlphabet[Math.floor(randSrc() * grabAlphabet.length)];
  };
  // Get a letter than can follow the last letter
  const grabNextGoodLetter = (word: string) => {
    const lastLetter = word[word.length - 1];
    const methodName = 'after' + lastLetter;
    let grabAlphabet = (ALPHABET_SOUP as any)[methodName]();
    return grabAlphabet[Math.floor(randSrc() * grabAlphabet.length)];
  };
  //===== END FUNCTIONS THAT GET NEXT LETTER

  // Increase/reset consonant and vowel counters appropriately
  const increaseCounters = (nextLetter: string) => {
    if (ALPHABET_SOUP.justVowels().includes(nextLetter)) {
      numConsonants = 0;
      numVowels += 1;
    } else {
      numConsonants += 1;
      numVowels = 0;
    }
  };

  const returnNextLetter = (word: string) => {
    let nextLetter;

    // If it's the first letter, grab any letter
    if (word.length === 0) {
      nextLetter = grabAnyLetter();
      // If it's not the first letter...
      // And there are too many consonants before it, grab a vowel
      // Or it's the second letter and the first wasn't a vowel (this makes sure there's a vowel in the first two letters for readability)
    } else if (
      numConsonants === 2 ||
      (word.length === 1 && numConsonants === 1)
    ) {
      nextLetter = grabAVowel();
      // Or if there are too many vowels grab a consonant
    } else if (numVowels === 2) {
      nextLetter = grabAConsonant();
      // Otherwise, grab the next acceptable letter
    } else {
      nextLetter = grabNextGoodLetter(word);
    }
    // Increase/reset consonant and vowel counters appropriately
    increaseCounters(nextLetter);
    return nextLetter;
  };

  // For readability, make sure word has a vowel in the last two letters
  const endWord = (word: string) => {
    let lastLetters = word.slice(-2);
    if (
      !ALPHABET_SOUP.justVowels().includes(lastLetters[0]) &&
      !ALPHABET_SOUP.justVowels().includes(lastLetters[1])
    ) {
      word += grabAVowel();
    }
    return word;
  };

  // Change first a and o (if present) to swedish characters
  const formatName = (word: string) => {
    // 50/50 chance of changing first a
    let coinToss = randSrc() < 0.5;
    if (coinToss) word = word.replace('a', 'å');
    // 50/50 chance of changing first o
    coinToss = randSrc() < 0.5;
    if (coinToss) word = word.replace('o', 'ö');
    return word;
  };

  // Generate each letter wordLength times
  for (let arrayIndex = 0; arrayIndex < wordLength; arrayIndex++) {
    word += returnNextLetter(word);
  }
  // Checks if word ended with two consonants. For readability, end with an extra vowel
  word = endWord(word);
  // Format name to add Swedish characters if possible
  word = formatName(word);

  return word;
};
