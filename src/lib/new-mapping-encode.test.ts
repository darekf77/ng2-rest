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

describe('encodeMapping - basic mapping', () => {
  it('should map root object to class instance', () => {
    const raw = { age: 33 };

    const result = encodeMapping<DecoratedUser>(raw, {
      '': DecoratedUser,
    });

    expect(result).toBeInstanceOf(DecoratedUser);
    expect(result.agePlusOne).toBe(34);
  });
});

describe('encodeMapping - deep mapping', () => {
  it('should map nested object using dot path', () => {
    const raw = {
      age: 20,
      book: {
        fat: true,
        author: {
          name: 'John',
        },
      },
    };

    const result = encodeMapping<User>(raw, {
      '': DecoratedUser,
      book: Book,
      'book.author': Author,
    });

    expect(result.book).toBeInstanceOf(Book);
    expect(result.book.author).toBeInstanceOf(Author);
    expect(result.book.author.name).toBe('John');
  });
});

describe('defaults', () => {
  it('should apply object and path defaults', () => {
    const raw = {};

    const result = encodeMapping<User>(raw, {
      '': DecoratedUser,
      book: Book,
      'book.author': Author,
    });

    expect(result.age).toBe(18);
    expect(result.book?.author?.name).toBe('Unknown');
  });
});

describe('encodeMapping - array header protocol', () => {
  it('should decode RLE header and map array elements', () => {
    const raw = [{ age: 10 }, { age: 20 }, null, { name: 'Author1' }];

    const headerSchema = {
      '[]': ['DecoratedUser#2', '#1', 'Author'],
    };

    const result = encodeMapping(raw, headerSchema);

    expect(result[0]).toBeInstanceOf(DecoratedUser);
    expect(result[1]).toBeInstanceOf(DecoratedUser);
    expect(result[2]).toBeNull();
    expect(result[3]).toBeInstanceOf(Author);
  });

  it('should decode header and map array elements when array is unified', () => {
    const raw = [{ age: 10 }, { age: 20 }];

    const headerSchema = {
      '': 'DecoratedUser',
    };

    const result = encodeMapping(raw, headerSchema);

    expect(result[0]).toBeInstanceOf(DecoratedUser);
    expect(result[1]).toBeInstanceOf(DecoratedUser);
  });
});

describe('deep mapping without direct rule on key', () => {
  it('should still recurse and apply deep rules', () => {
    const raw = {
      book: {
        author: {
          name: 'X',
        },
      },
    };

    const result = encodeMapping<User>(raw, {
      '': DecoratedUser,
      'book.author': Author,
    });

    expect(result.book.author).toBeInstanceOf(Author);
  });
});
