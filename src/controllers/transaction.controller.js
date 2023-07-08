import { ObjectId } from 'mongodb';
import { db } from '../app.js';

export const postTransaction = async (req, res) => {
  const { type } = req.params;
  const { authorization } = req.headers;

  if (!authorization) return res.sendStatus(401);

  //fiz a verificação de float sem a biblioteca joi pelos seguites motivos:
  //https://github.com/hapijs/joi/issues/112
  //https://github.com/hapijs/joi/issues/2699
  if (Number.isInteger(req.body.value)) return res.status(422).send('\"value\" must be a float');

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
};

export const getTransactions = async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);

  try {
    const token = authorization.replace('Bearer ', '');
    const session = await db.collection('sessions').findOne({ token });
    if (!session) return res.sendStatus(401);
  
    const transactions = await db.collection('transactions')
      .find({ idUser: session.idUser })
      .sort({ timeStamp: -1 })
      .toArray()
    ;
    res.send(transactions);
    
  } catch ({ message }) {
    res.status(500).send(message);
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);

  try{
    const token = authorization.replace('Bearer ', '');
    const session = await db.collection('sessions').findOne({ token });
    if (!session) return res.sendStatus(401);

    const {deletedCount} = await db.collection('transactions').deleteOne({_id: new ObjectId(id)});
    if (deletedCount === 0) return res.status(404).send('transaction not found');

    res.status(204).send('deleted');
  } catch ({ message }) {
    res.status(500).send(message);
  }
};

export const putTransaction = async (req, res) => {
  const { id } = req.params;
  const { value, description } = req.body;
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);

  try{
    const token = authorization.replace('Bearer ', '');
    const session = await db.collection('sessions').findOne({ token });
    if (!session) return res.sendStatus(401);

    const { matchedCount } = await db.collection('transactions').updateOne(
      { _id : new ObjectId(id) },
      { $set : { value, description } }
    );
    if (matchedCount === 0) return res.status(404).send('transaction not found');

    res.status(202).send('edited');
  } catch ({ message }) {
    res.status(500).send(message);
  }
};