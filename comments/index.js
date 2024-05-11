const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const amqp = require('amqplib');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let connection, channel;
const commentsByPostId = {};

const connect = async () => {
  try {
    connection = await amqp.connect("amqp://rabbitmq-srv");
    channel = await connection.createChannel();
    await channel.assertExchange("comments_exchange", "direct");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

app.get('/posts/:id/comments', (req, res) => {
  res.status(200).json(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  try {
    if (!channel) {
      await connect();
    }

    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;
    const comments = commentsByPostId[req.params.id] || [];
    comments.push({ id: commentId, content, status: 'pending' });
    commentsByPostId[req.params.id] = comments;

    await channel.publish("posts_exchange", "comment_created",
      Buffer.from(
        JSON.stringify({
          type: "CommentCreated",
          data: { id: commentId, content, postId: req.params.id, status: "pending" }
        })
      ),
      { contentType: "application/json" }
    )

    res.status(201).send(comments);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erroror while creating comment!");
  }
});

app.listen(4001, () => {
  console.log("Listening on port 4001");
})