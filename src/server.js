import express from 'express';
import expressGraphql from 'express-graphql';
import { buildSchema } from 'graphql';
import graphqlFields from 'graphql-fields';

import { initDBIfNeeded, getCoursesData, updateCourseData } from './db';

// GraphQL schema
const schema = buildSchema(`
    type Query {
        courseById(id: Int!): Course
        courses(title: String, author: String, description: String, topic: String, url: String): [Course]
    },
    type Mutation {
        updateCourseTopic(id: Int!, topic: String!): Course
    },
    type Course {
        id: Int
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
`);

// Logic
const getCourses = ({ singleResult = false } = {}) => async (args, context, info) => {
  const result = await getCoursesData({
    query: args,
    requestedParams: Object.keys(graphqlFields(info)),
  });

  return singleResult ? result[0] : result;
};

const updateCourseTopic = async ({ id, topic }, context, info) => {
  await updateCourseData({ query: { id }, newValues: { topic } });

  const result = await getCoursesData({
    query: { id },
    requestedParams: Object.keys(graphqlFields(info)),
  });

  return result[0];
};

// Root resolver
const rootValue = {
  courseById: getCourses({ singleResult: true }),
  courses: getCourses(),
  updateCourseTopic,
};

// Init DB when needed
initDBIfNeeded();

// Create an express server and a GraphQL endpoint
const app = express();
app.use(
  '/graphql',
  expressGraphql({
    schema,
    rootValue,
    graphiql: true,
  }),
);
app.listen(4000, () =>
  console.log('Express GraphQL server now runs locally on localhost:4000/graphql'),
);
