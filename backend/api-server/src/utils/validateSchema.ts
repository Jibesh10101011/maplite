import { ZodObject, ZodRawShape } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateSchema =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      console.log(err);
      return res.status(400).json({ error: err.errors });
    }
  };
