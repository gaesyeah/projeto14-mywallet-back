import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';
import { logOut, signIn, signUp } from './controllers/auth.controller.js';
import { deleteTransaction, getTransactions, postTransaction, putTransaction } from './controllers/transaction.controller.js';

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
export const db = mongoClient.db();

app.post('/sign-up', signUp);
app.post('/sign-in', signIn);
app.delete('/log-out', logOut);

app.post('/transactions/:type', postTransaction);
app.get('/transactions', getTransactions);
app.delete('/transactions/:id', deleteTransaction);
app.put('/transactions/:id', putTransaction);

//LISTEN
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));