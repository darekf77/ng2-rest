import { CLASS } from 'typescript-class-helpers/src';

import {
  DefaultMapping,
  DefaultModel,
  encodeMapping,
  decodeMappingForHeaderJson,
  getMappingHeaderString,
} from './new-mapping';

//#region test models

@CLASS.NAME('Author')
class Author {
  name!: string;
}

@CLASS.NAME('DecoratedAuthor')
@DefaultMapping(() => ({
  '': Author,
}))
class DecoratedAuthor extends Author {}

@CLASS.NAME('Book')
class Book {
  fat!: boolean;

  author!: Author;
}

@CLASS.NAME('DecoratedBook')
@DefaultMapping(() => ({
  '': Book,
  author: Author,
}))
class DecoratedBook extends Book {}

@CLASS.NAME('User')
class User {
  age!: number;

  book!: Book;
}

@CLASS.NAME('DecoratedUser')
@DefaultMapping(() => ({
  '': DecoratedUser,
  book: Book,
  'book.author': Author,
}))
@DefaultModel<DecoratedUser>(() => ({
  age: 18,
  'book.author.name': 'Unknown',
}))
class DecoratedUser extends User {
  get agePlusOne(): number {
    return this.age + 1;
  }
}

//#endregion

describe('decodeMappingForHeaderJson - single', () => {
  it('should generate mapping header for class', () => {
    const mapping = decodeMappingForHeaderJson(DecoratedUser);

    expect(mapping?.['']).toBe(CLASS.getName(DecoratedUser));
    expect(mapping?.['book']).toBe(CLASS.getName(Book));
    expect(mapping?.['book.author']).toBe(CLASS.getName(Author));
  });
});

describe('decodeMappingForHeaderJson - array RLE', () => {
  it('should RLE encode class array', () => {
    const array = [DecoratedUser, DecoratedUser, null, null, Author, null];

    const mapping = decodeMappingForHeaderJson(array as any);

    expect(mapping?.['[]']).toEqual(['DecoratedUser#2', '#2', 'Author', '']);
  });
});

describe('getMappingHeaderString', () => {
  it('should stringify mapping', () => {
    const header = getMappingHeaderString(DecoratedUser);

    expect(typeof header).toBe('string');

    const parsed = JSON.parse(header);
    expect(parsed['']).toBe(CLASS.getName(DecoratedUser));
  });
});
