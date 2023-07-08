import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';
import indexRouter from './routes/index.routes.js';

//configuração do servidor
const app = express();
app.use(express.json(), cors());

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
export const db = mongoClient.db();

//uso das rotas
app.use(indexRouter);

//LISTEN
const port = PORT || 5000;
app.listen(port, () => console.log(`Rodando em http://localhost:${port}`));