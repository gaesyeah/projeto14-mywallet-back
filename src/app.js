import bcrypt from 'bcrypt';
import cors from 'cors';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import express from 'express';
import joi from 'joi';
import { MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';

//configuração do servidor
const app = express();
app.use(express.json());
app.use(cors());

//configuração do dotenv
dotenv.config();
const { DATABASE_URL, PORT } = process.env;

//configuração do mongod
const mongoClient = new MongoClient(DATABASE_URL);
try {
  mongoClient.connect();
  console.log(`Conectado ao banco ${DATABASE_URL}`);
} catch ({ message }){
  console.log(message);
}
const db = mongoClient.db();

//POST sign-up
app.post('/sign-up', async (req, res) => {
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
});

//POST sign-in
app.post('/sign-in', async (req, res) => {
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
});

//POST transactions
app.post('/transactions/:type', async (req, res) => {
  const { type } = req.params;
  const { authorization } = req.headers;

  if (!authorization) return res.sendStatus(401);

  const errorMessages = [];
  //fiz a verificação de float sem a biblioteca joi pelos seguites motivos:
  //https://github.com/hapijs/joi/issues/112
  //https://github.com/hapijs/joi/issues/2699
  if (Number.isInteger(req.body.value)) errorMessages.push('\"value\" must be a float');
  
  const transactionSchema = joi.object({
    description: joi.string().required(),
    value: joi.number().positive().required(), 
    type: joi.string().valid('entry', 'exit').required()
  });
  const { error } = transactionSchema.validate({ ...req.body, type }, { abortEarly: false });
  if (error) error.details.forEach(({ message }) => errorMessages.push(message));

  if (errorMessages.length > 0) return res.status(422).send(errorMessages);

  try {
    const token = authorization.replace('Bearer ', '');
    const session = await db.collection('sessions').findOne({ token });
    if (!session) return res.sendStatus(401);

    await db.collection('transactions').insertOne({ 
      ...req.body,
      type, 
      timeStamp: Date.now(), 
      idUser: session.idUser
    });
    res.sendStatus(201);
    
  } catch ({ message }) {
    res.status(500).send(message);
  }
});

//GET transactions
app.get('/transactions', async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);

  try {
    const token = authorization.replace('Bearer ', '');
    const session = await db.collection('sessions').findOne({ token });
    if (!session) return res.sendStatus(401);
  
    const transactions = await db.collection('transactions')
      .find({ idUser: session.idUser })
      .sort({ timeStamp: 1 })
      .toArray()
    ;
    res.send(transactions);
    
  } catch ({ message }) {
    res.status(500).send(message);
  }

});

//LISTEN
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));