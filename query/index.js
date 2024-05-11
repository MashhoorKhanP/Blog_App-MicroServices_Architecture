const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let connection, channel;
const posts = {};

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
}

(async () => {
  try {
    connection = await amqp.connect('amqp://rabbitmq-srv');
    channel = await connection.createChannel();
    await channel.assertExchange("post_exchange", "direct");

    const q = await channel.assertQueue("query-queue");
    await channel.bindQueue(q.queue, "posts_exchange", "post_created");
    await channel.bindQueue(q.queue, "posts_exchange", "comment_created");
    await channel.bindQueue(q.queue, "posts_exchange", "comment_moderated");

    channel.consume(q.queue, (msg) => {
      const { type, data } = JSON.parse(msg.content.toString());
      console.log("msg", type, data);
      handleEvent(type, data);
      channel.ack(msg)
    })
  } catch (error) {
    console.erroror(error);
    throw error;
  }
})();

app.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

app.listen(4002, async () => {
  console.log('Listening on port 4002');
});