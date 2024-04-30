const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.status(200).json(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async(req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ id: commentId, content });
  commentsByPostId[req.params.id] = comments;

  await axios.post('http://localhost:4005/events', {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id
    }
  })  
  res.status(201).json(comments);

});

app.post('/events',(req,res) => {
  console.log('Recieved event', req.body.type);
  res.status(200).json(req.body.type);
})

app.listen(4001, () => {
  console.log("Listening on http://localhost:4001");
})