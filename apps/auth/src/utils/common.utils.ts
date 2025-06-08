import * as pbkdf2 from 'pbkdf2';
import * as util from 'util';
import * as crypto from 'crypto';
import { getRandomCharacter } from '@app/common';

const pbkdf2Async = util.promisify(pbkdf2.pbkdf2);

export enum PASSWORD_KEY {
  iterations = 10000,
  keyLength = 64,
  hashAlgorithm = 'sha512',
  salt = 'phising',
}
export const hashPassword = async (password) => {
  const key = await pbkdf2Async(
    password,
    PASSWORD_KEY.salt,
    PASSWORD_KEY.iterations,
    PASSWORD_KEY.keyLength,
    PASSWORD_KEY.hashAlgorithm,
  );
  const hash = key.toString('hex');
  return hash;
};



export const comparePassword = async (enteredPassword: string, storedPassword: string): Promise<boolean> => {
  const hashEnteredPassword = await pbkdf2Async(
    enteredPassword,
    PASSWORD_KEY.salt,
    PASSWORD_KEY.iterations,
    PASSWORD_KEY.keyLength,
    PASSWORD_KEY.hashAlgorithm,
  );

  const storedPasswordBuffer = Buffer.from(storedPassword, 'hex');
  const enteredPasswordBuffer = Buffer.from(hashEnteredPassword.toString('hex'), 'hex');

  if (storedPasswordBuffer.length !== enteredPasswordBuffer.length) {

    return false;
  }

  return crypto.timingSafeEqual(storedPasswordBuffer, enteredPasswordBuffer);
};


export const getHashKeys = async () => {
  const key = await pbkdf2Async(
    getRandomCharacter(20),
    PASSWORD_KEY.salt,
    PASSWORD_KEY.iterations,
    PASSWORD_KEY.keyLength,
    PASSWORD_KEY.hashAlgorithm,
  );
  const hash = key.toString('hex');
  return hash;
};

export const generateRandomePassword = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let password = '';

  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
};

export const generateUserRandomPassword = () => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numericChars = '0123456789';
  const specialChars = '!@#';
  const allChars = `${uppercaseChars}${lowercaseChars}${numericChars}${specialChars}`;

  const getRandomChar = (charSet) => charSet.charAt(Math.floor(Math.random() * charSet.length));

  // Ensure at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
  const randomUppercaseChar = getRandomChar(uppercaseChars);
  const randomLowercaseChar = getRandomChar(lowercaseChars);
  const randomNumberChar = getRandomChar(numericChars);
  const randomSpecialChar = getRandomChar(specialChars);

  // Generate the remaining characters
  let password = randomUppercaseChar + randomLowercaseChar + randomNumberChar + randomSpecialChar;
  for (let i = 4; i < 10; i++) {
    const randomChar = getRandomChar(allChars);
    password += randomChar;
  }

  // Shuffle the password characters
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
};

