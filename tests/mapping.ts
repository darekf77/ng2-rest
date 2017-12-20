
class Author {
    age: number;
    user: User;
    friends: User[];
}

class Book {
    title: string;
    author: Author;
}

class User {
    name: string;
    friend: Author;
    books: Book[];
}


// const c = Resource.create<{ name: string; }>('http://onet.pl', 'adasd', User);
// console.log(c)

let uu = new User();
uu.name = 'asdasd';
let book = new Book();
book.author = new Author();
book.title = 'roses';
book.author.friends = [new User(), new User()]
book.author.user = new User();
uu.friend = new Author();
uu.friend.age = 23;
uu.friend.user = new User();
uu.books = [book];


