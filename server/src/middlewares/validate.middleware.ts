import { ZodError } from "zod";
import { NextFunction, Request, Response } from "express";

/**
 * Validate middleware — wraps a Zod schema into an Express middleware.
 * Place it before the controller on any route that needs input validation.
 *
 * Usage: router.post("/route", validate(mySchema), myController)
 *
 * If validation fails → returns 400 with a structured list of errors.
 * If validation passes → calls next() and the controller runs normally.
 */
export function validate(schema: { parse: (data: unknown) => unknown }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse body, query params, and route params all at once
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // error.issues gives a structured list of all validation failures
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
      }

      next(error);
    }
  };
}