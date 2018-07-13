import express from 'express';
import expressGraphql from 'express-graphql';
import { buildSchema } from 'graphql';

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
const coursesData = [
  {
    id: 1,
    title: 'The Complete Node.js Developer Course',
    author: 'Andrew Mead, Rob Percival',
    description:
      'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
    topic: 'Node.js',
    url: 'https://codingthesmartway.com/courses/nodejs/',
  },
  {
    id: 2,
    title: 'Node.js, Express & MongoDB Dev to Deployment',
    author: 'Brad Traversy',
    description:
      'Learn by example building & deploying real-world Node.js applications from absolute scratch',
    topic: 'Node.js',
    url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/',
  },
  {
    id: 3,
    title: 'JavaScript: Understanding The Weird Parts',
    author: 'Anthony Alicea',
    description:
      'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
    topic: 'JavaScript',
    url: 'https://codingthesmartway.com/courses/understand-javascript/',
  },
];

const getCourse = args => coursesData.filter(course => course.id === args.id)[0];
const getCourses = args => {
  if (args.topic) {
    return coursesData.filter(course => course.topic === args.topic);
  } else {
    return coursesData;
  }
};
const updateCourseTopic = ({ id, topic }) => {
  coursesData.map(course => {
    if (course.id === id) {
      course.topic = topic;
      return course;
    }
  });

  return coursesData.filter(course => course.id === id)[0];
};

// Root resolver
const rootValue = {
  course: getCourse,
  courses: getCourses,
  updateCourseTopic
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
