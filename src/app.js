import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import joi from 'joi';
import { MongoClient } from 'mongodb';

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

//POST users
app.post('/users', async (req, res) => {
  const { email } = req.body;
  
  const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: [
      joi.string().required().min(3), 
      joi.number().required().min(3)
    ]
  });
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(422).send(error.details.map(({ message }) => message));

  try {
    const emailAlreadyUsed = await db.collection('users').findOne({ email });
    if (emailAlreadyUsed) return res.sendStatus(409);

    await db.collection('users').insertOne(req.body);
    res.sendStatus(201);
    
  } catch ({ message }) {
    res.status(500).send(message);
  }
})

//GET users
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.send(users);
  } catch ({ message }){
    res.status(500).send(message);
  }
})

//POST login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: [
      joi.string().required(), 
      joi.number().required()
    ]
  });
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(422).send(error.details.map(({ message }) => message));

  try {
    const registeredEmail = await db.collection('users').findOne({ email });
    if (!registeredEmail) return res.sendStatus(404);
    
    const equalPassword = await db.collection('users').findOne({
      $and: [{ email }, { password }]
    });
    if (!equalPassword) return res.sendStatus(401);

    //implementar token
    return res.send('token');

  } catch ({ message }){
    res.status(500).send(message);
  }
})


//LISTEN
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));