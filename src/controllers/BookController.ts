import { Request, Response } from 'express';
import BookService, { BookInput } from '../services/BookService';

export default class BookController {
  constructor(private service: BookService = new BookService()) {}

  findAll = async (_req: Request, res: Response) => {
    const books = await this.service.findAll();
    res.send(books);
  };

  add = async (req: Request, res: Response) => {
    const input = req.body as BookInput;
    await this.service.add(input);
    res.send('new book created');
  };

  findByid = async (req: Request, res: Response) => {
    const id = req.body.id as string;
    const result = await this.service.findById(id);
    res.send(result);
  };

  editById = async (req: Request, res: Response) => {
    const input = req.body as BookInput;
    await this.service.editById(input);
    res.send('book updated');
  };

  deleteById = async (req: Request, res: Response) => {
    const id = req.body.id as string;
    await this.service.deleteById(id);
    res.send('book deleted');
  };
}
