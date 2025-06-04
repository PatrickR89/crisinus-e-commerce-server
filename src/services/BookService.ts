import { v4 as uuidv4 } from 'uuid';
import { dbPoolPromise } from '../databaseMiddleware/mySqlConnection';
import conditionalArrayParse from '../utils/conditionalArrayParse';

export interface AuthorInput { name: string; last_name: string; id?: string; }

export interface BookInput {
  title: string;
  genre: string;
  maxOrder: number;
  price: number;
  publisher: string;
  language: string;
  year: number;
  desc: string;
  images: string[];
  authors: AuthorInput[];
  bookId?: string;
}

export default class BookService {
  async findAll() {
    const [result] = await dbPoolPromise.execute('SELECT * FROM books');
    const books = (result as any[]).map((book) => {
      const newBook = { ...book };
      newBook.authors = conditionalArrayParse(book.authors);
      newBook.images = conditionalArrayParse(book.images);
      return newBook;
    });
    return books;
  }

  async add(input: BookInput) {
    const authorsIds = await this.populateAuthors(input.authors);
    const tempImgs = JSON.stringify(input.images);
    const tempAuthors = JSON.stringify(authorsIds);
    await dbPoolPromise.execute(
      'INSERT INTO books (id, title, images, genre, max_order, price, publisher, language, year, description, authors) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [
        uuidv4(),
        input.title,
        tempImgs,
        input.genre,
        input.maxOrder,
        input.price,
        input.publisher,
        input.language,
        input.year,
        input.desc,
        tempAuthors
      ]
    );
  }

  async findById(id: string) {
    const [rows] = await dbPoolPromise.execute('SELECT * FROM books WHERE id = ?', [id]);
    const book = (rows as any[])[0];
    const authorsIds = book.authors;
    const authors = await this.findAuthorsPerBook(authorsIds);
    const tempBook = { ...book };
    tempBook.images = conditionalArrayParse(book.images);
    return [tempBook, authors];
  }

  async editById(input: BookInput) {
    const authorsIds = await this.populateAuthors(input.authors);
    const tempImgs = JSON.stringify(input.images);
    const tempAuthors = JSON.stringify(authorsIds);
    await dbPoolPromise.execute(
      'UPDATE books SET title = ?, authors = ?, genre = ?, max_order = ?, price = ?, publisher = ?, language = ?, year = ?, description = ?, images = ? WHERE id = ?',
      [
        input.title,
        tempAuthors,
        input.genre,
        input.maxOrder,
        input.price,
        input.publisher,
        input.language,
        input.year,
        input.desc,
        tempImgs,
        input.bookId
      ]
    );
  }

  async deleteById(id: string) {
    await dbPoolPromise.execute('DELETE FROM books WHERE id = ?', [id]);
  }

  private async fetchOrSaveAuthor(author: AuthorInput): Promise<string> {
    const [rows] = await dbPoolPromise.execute(
      'SELECT id FROM authors WHERE name = ? AND last_name = ?',
      [author.name, author.last_name]
    );
    const resultDB = rows as any[];
    if (resultDB.length < 1) {
      author.id = uuidv4();
      await dbPoolPromise.execute(
        'INSERT INTO authors (id, name, last_name) VALUES (?,?,?)',
        [author.id, author.name, author.last_name]
      );
      return author.id;
    }
    return resultDB[0].id;
  }

  private async populateAuthors(authors: AuthorInput[]): Promise<string[]> {
    const authorsIds: string[] = [];
    if (!Array.isArray(authors)) return [];
    for (const author of authors) {
      const result = await this.fetchOrSaveAuthor(author);
      authorsIds.push(result);
    }
    return authorsIds;
  }

  private async findAuthorsPerBook(ids: string[] | string): Promise<any[]> {
    const authors: any[] = [];
    let tempIds: string[] = Array.isArray(ids) ? [...ids] : [...JSON.parse(ids as string)];
    for (const id of tempIds) {
      const author = await this.findAuthorById(id);
      authors.push(author);
    }
    return authors;
  }

  private async findAuthorById(id: string) {
    const [rows] = await dbPoolPromise.execute('SELECT * FROM authors WHERE id = ?', [id]);
    return (rows as any[])[0];
  }
}
