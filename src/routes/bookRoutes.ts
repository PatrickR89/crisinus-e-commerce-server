import { Router } from 'express';
import { verifyJWT } from '../JWT/jwtMiddleware';
import { catchRequestError } from '../utils/catchAsync';
import BookController from '../controllers/BookController';

const router = Router();
const controller = new BookController();

router
  .route('/')
  .get(catchRequestError(controller.findAll))
  .post(verifyJWT, catchRequestError(controller.add));

router
  .route('/:id')
  .post(verifyJWT, catchRequestError(controller.findByid))
  .put(verifyJWT, catchRequestError(controller.editById))
  .delete(verifyJWT, catchRequestError(controller.deleteById));

export default router;
