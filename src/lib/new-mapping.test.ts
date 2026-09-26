import { CLASS } from 'typescript-class-helpers/src';
import { encodeMapping } from './new-mapping';

describe('encodeMapping - getters', () => {
  it('should skip getter-only properties instead of throwing', () => {
    @CLASS.NAME('User')
    class User {
      firstName = '';

      get fullName(): string {
        return `User: ${this.firstName}`;
      }
    }

    const input = {
      firstName: 'Dariusz',
      fullName: 'THIS SHOULD NOT OVERRIDE GETTER',
    };

    const result = encodeMapping<User>(input, {
      '': User,
    });

    expect(result).toBeInstanceOf(User);
    expect(result.firstName).toBe('Dariusz');
    expect(result.fullName).toBe('User: Dariusz');
  });

  it('should not create own property over prototype getter', () => {
    @CLASS.NAME('User')
    class User {
      get computedValue(): string {
        return 'computed';
      }
    }

    const result = encodeMapping<User>(
      {
        computedValue: 'from-json',
      },
      {
        '': User,
      },
    );

    expect(result.computedValue).toBe('computed');

    expect(Object.prototype.hasOwnProperty.call(result, 'computedValue')).toBe(
      false,
    );
  });

  it('should map normal properties next to getter properties', () => {
    @CLASS.NAME('User')
    class User {
      name = '';
      age = 0;

      get description(): string {
        return `${this.name}:${this.age}`;
      }
    }

    const result = encodeMapping<User>(
      {
        name: 'Dariusz',
        age: 40,
        description: 'invalid serialized value',
      },
      {
        '': User,
      },
    );

    expect(result).toBeInstanceOf(User);
    expect(result.name).toBe('Dariusz');
    expect(result.age).toBe(40);
    expect(result.description).toBe('Dariusz:40');
  });

  it('should allow accessor property when setter exists', () => {
    @CLASS.NAME('User')
    class User {
      private _name = '';

      get name(): string {
        return this._name;
      }

      set name(value: string) {
        this._name = value;
      }
    }

    const result = encodeMapping<User>(
      {
        name: 'Dariusz',
      },
      {
        '': User,
      },
    );

    expect(result).toBeInstanceOf(User);
    expect(result.name).toBe('Dariusz');
  });

  it('should skip inherited getter-only properties', () => {

    @CLASS.NAME('BaseEntity')
    class BaseEntity {
      get displayName(): string {
        return 'base-display-name';
      }
    }

    @CLASS.NAME('User')
    class User extends BaseEntity {
      name = '';
    }

    const result = encodeMapping<User>(
      {
        name: 'Dariusz',
        displayName: 'serialized-display-name',
      },
      {
        '': User,
      },
    );

    expect(result.name).toBe('Dariusz');
    expect(result.displayName).toBe('base-display-name');

    expect(Object.prototype.hasOwnProperty.call(result, 'displayName')).toBe(
      false,
    );
  });

  it('should not throw when JSON contains multiple getter-only properties', () => {
    @CLASS.NAME('User')
    class User {
      name = '';

      get id(): string {
        return 'generated-id';
      }

      get label(): string {
        return `User ${this.name}`;
      }
    }

    expect(() =>
      encodeMapping<User>(
        {
          name: 'Dariusz',
          id: 'server-id',
          label: 'server-label',
        },
        {
          '': User,
        },
      ),
    ).not.toThrow();
  });
});
