const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const ampq = require('amqplib');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let connection, channel;
const posts = {};

(async () => {
  try {
    connection = await ampq.connect("amqp://rabbitmq-srv");
    channel = await connection.createChannel();
    await channel.assertExchange("posts_exchange", "direct", { durable: true });
  } catch (error) {
    console.log(error);
    throw error;
  }
})();

app.post('/posts/create', async (req, res) => {
  try {
    if (!channel) {
      await connect()
      const id = randomBytes(4).toString('hex');
      const { title } = req.body;
      posts[id] = {
        id, title
      }

      //Publish Message function
      await channel.publish("posts_exchange", "post_created", Buffer.from(JSON.stringify({
        type: 'PostCreated',
        data: { id, title }
      })))

      res.status(201).send(posts[id]);
    }

  } catch (error) {
    console.log(error);
    res.status(500).send("Error while creating post!");
  }
});

app.listen(4000, () => {
  console.log('v2')
  console.log("Listening on port 4000");
});