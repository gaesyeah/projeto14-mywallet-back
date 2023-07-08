import { db } from "../app.js";

export const userUnauthorized = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) return res.sendStatus(401);

  try{
    const token = authorization.replace('Bearer ', '');
    const session = await db.collection('sessions').findOne({ token });
    if (!session) return res.sendStatus(401);

    res.locals.session = session;
    next();
    
  } catch ({ message }) {
    res.status(500).send(message);
  }

}
