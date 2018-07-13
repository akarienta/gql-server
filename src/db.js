import { MongoClient } from 'mongodb';

const DB_NAME = 'gql-server';
const USER = 'gql-server';
const PASSWORD = 'test1001';
const HOST = 'ds221339.mlab.com';
const PORT = '21339';
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

      // TODO: _id
      await dbo.collection(COLLECTION).insertMany(coursesData, err => {
        if (err) throw err;
        db.close();
      });
    } else {
      console.log('DB is already initialized');
    }
  });
};

const getCoursesData = () =>
  new Promise(resolve =>
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;

      const dbo = db.db(DB_NAME);

      dbo
        .collection(COLLECTION)
        .find({})
        .toArray((err, res) => {
          if (err) throw err;

          db.close();

          resolve(res);
        });
    }),
  );

export { initDBIfNeeded, getCoursesData };
