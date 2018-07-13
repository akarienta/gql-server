import express from 'express';
import expressGraphql from 'express-graphql';
import { buildSchema } from 'graphql';

import { getCoursesData } from './db';

// TODO: initDBIfNeeded();

// GraphQL schema
const schema = buildSchema(`
    type Query {
        course(id: Int!): Course
        courses(topic: String): [Course]
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
// const getCourse = args => coursesData.filter(course => course.id === args.id)[0];
const getCourses = async args => {
  const coursesData = await getCoursesData();
  if (args.topic) {
    return coursesData.filter(course => course.topic === args.topic);
  } else {
    return coursesData;
  }
};
// const updateCourseTopic = ({ id, topic }) => {
//   coursesData.map(course => {
//     if (course.id === id) {
//       course.topic = topic;
//       return course;
//     }
//   });
//
//   return coursesData.filter(course => course.id === id)[0];
// };

// Root resolver
const rootValue = {
  //course: getCourse,
  courses: getCourses,
  //updateCourseTopic,
};

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
