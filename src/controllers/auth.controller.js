import bcrypt from 'bcrypt';
import joi from 'joi';
import { v4 as uuid } from 'uuid';
import { db } from '../app.js';

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  
  const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: [
      joi.string().required().min(3), 
      joi.number().required().min(3)
    ]
  });
  const { error } = signUpSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(422).send(error.details.map(({ message }) => message));

  try {
    const emailAlreadyUsed = await db.collection('users').findOne({ email });
    if (emailAlreadyUsed) return res.status(409).send('email already used');

    const passwordHash = bcrypt.hashSync(password, 10);
    await db.collection('users').insertOne({ name, email, password: passwordHash });
    res.sendStatus(201);
    
  } catch ({ message }) {
    res.status(500).send(message);
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: [
      joi.string().required(), 
      joi.number().required()
    ]
  });
  const { error } = signInSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(422).send(error.details.map(({ message }) => message));

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).send('email not registered');
    
    const rightPassword = bcrypt.compareSync(password, user.password);
    if (!rightPassword) return res.status(401).send('wrong password');

    const token = uuid();
    await db.collection('sessions').insertOne({ token, idUser: user._id, name: user.name });
    const session = await db.collection('sessions').findOne({ token });
    res.send(session);

  } catch ({ message }){
    res.status(500).send(message);
  }
};

export const logOut = async (req, res) => {
  const { authorization } = req.headers;

  try {
    const { deletedCount } = await db.collection('sessions').deleteOne({ token: authorization.replace('Bearer ', '') });
    if (deletedCount === 0) return res.status(404).send('session not found');

    res.sendStatus(200);
  } catch ({ message }) {
    res.status(500).send(message);
  }
};