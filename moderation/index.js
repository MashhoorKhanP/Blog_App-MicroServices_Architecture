const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let connection, channel;

const connect = async () => {
  try {
    connection = await amqp.connect("amqp://rabbitmq-srv");
    channel = await connection.createChannel();
    await channel.assertExchange("posts_exchange", "direct");

    const q = await channel.assertQueue("moderation_queue");
    await channel.bindQueue(q.queue, "posts_exchange", "comment_created");

    channel.consume(q.queue, (msg) => {
      const { type, data } = JSON.parse(msg.content.toString());

      if (type === "CommentCreated") {
        const status = data.content.includes("orange") ? "rejected" : "approved";
        console.log("status:", status);

        channel.publish("posts_exchange", "comment_moderated", Buffer.from(JSON.stringify({
          type: "CommentModerated",
          data: { ...data, status }
        })), { contentType: "application/json" })
      }
      channel.ack(msg);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

connect();

app.listen(4003, () => console.log("Listening on port 4003"));