const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


const posts = {};

app.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = {
    id, title
  }

  await axios.post('http://events-bus-srv:4005/events', {
    type: 'PostCreated',
    data: {
      id, title
    }
  })

  res.status(201).send(posts[id]);

});

app.post('/events', (req, res) => {
  console.log('Recieved event', req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log('v2')
  console.log("Listening on port 4000"); 
});