// Common utilities fuctions

export const getRandomCharacter = (length) => {
  let result = '';
  const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  for (let i = 0; i < length; i++) {
    result += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  return result;
};

export const sendResponse = (message) => {
  return {
    message,
  };
};
