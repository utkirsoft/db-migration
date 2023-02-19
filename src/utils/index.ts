import ObjectID from 'bson-objectid';

export const objectId = () => new ObjectID().toString();

export function isValidString(str) {
  if (str === null || str === undefined) {
    return false;
  }
  return true;
}

export const isCyrillic = (str) => /[\u0400-\u04FF]/g.test(str);
