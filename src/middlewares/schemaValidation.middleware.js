export const schemaValidation = (schema) => {
  return (req, res, next) => {
    let body;
    const { type } = req.params;
    if (type) {
      body = {...req.body, type};
    } else {
      body = req.body;
    }

    const { error } = schema.validate({ ...body }, { abortEarly: false });
    if (error) return res.status(422).send(error.details.map(({ message }) => message));

    next();
  }
};