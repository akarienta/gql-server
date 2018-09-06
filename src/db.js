import { MongoClient } from 'mongodb';
import zipObject from 'lodash/zipObject';
import map from 'lodash/map';
import merge from 'lodash/merge';

const DB_NAME = 'gql-server';
const USER = 'gql-server';
const PASSWORD = 'test1001';
const HOST = 'ds145412.mlab.com';
const PORT = '45412';
const COLLECTION = 'courses';

const url = `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}`;

const initDBIfNeeded = async () => {
  const coursesData = await require('./init-data.json');

  MongoClient.connect(url, { useNewUrlParser: true }, async (err, db) => {
    if (err) throw err;

    const dbo = db.db(DB_NAME);
    const doesCollectionExist = new Promise(resolve => {
      dbo
        .listCollections({ name: COLLECTION })
        .next((err, collectionInfo) => resolve(!!collectionInfo));
    });

    if (!await doesCollectionExist) {
      console.log('Initializing DB...');

      await dbo.createCollection(COLLECTION, err => {
        if (err) throw err;
        db.close();
      });

      await dbo.collection(COLLECTION).insertMany(coursesData, err => {
        if (err) throw err;
        db.close();
      });
    } else {
      console.log('DB is already initialized');
      db.close();
    }
  });
};

const getCoursesData = ({ query = {}, requestedParams = {} } = {}) => {
  const allowedParams = zipObject(requestedParams, map(requestedParams, () => 1));
  const disallowedParams = { _id: 0 };
  const projection = merge(allowedParams, disallowedParams);

  return new Promise(resolve =>
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;

      const dbo = db.db(DB_NAME);

      dbo
        .collection(COLLECTION)
        .find(query, { projection })
        .toArray((err, res) => {
          if (err) throw err;

          db.close();

          console.log('Retrieving data from DB...');
          console.log(res);

          resolve(res);
        });
    }),
  );
};

const updateCourseData = ({ query, newValues }) =>
  new Promise(resolve =>
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;

      const dbo = db.db(DB_NAME);
      console.log('Trying to update document...');
      console.log({ query, newValues });

      dbo.collection(COLLECTION).updateOne(query, { $set: newValues }, (err, res) => {
        if (err) throw err;

        console.log(`Number of updated documents: ${res.result.nModified}`);

        db.close();

        resolve();
      });
    }),
  );

export { initDBIfNeeded, getCoursesData, updateCourseData };
