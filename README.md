# Simple Microservices Blog Application

This project demonstrates a microservices architecture using Skaffold for development and deployment, along with Ingress Nginx for routing and external access. Each microservice handles a specific task, ensuring the application is scalable and easy to maintain.

## Project Structure

The project is structured as follows:

- **client:** Frontend interface for users.
- **comments:** Manages comment-related functionalities.
- **moderation:** Handles content moderation tasks.
- **posts:** Deals with post-related operations.
- **query:** Retrieves and presents data to users.

## How to Use
To use this application, you need to have Node.js and Docker installed on your computer.

1. Clone the project repository to your computer.
2. Navigate to the project directory in your terminal.
3. Run `skaffold dev` to start the application. This command will build and run all the microservices.

## Implementation Details
- **main Branch:** In the main branch, you'll find the implementation using an events bus for communication between microservices.
- **rabbitmq Branch:** In the rabbitmq branch, you'll see the same application but using RabbitMQ instead of an events bus for communication.

## Messaging System with RabbitMQ

RabbitMQ is utilized as the messaging system to enable communication between microservices. It sets up message queues and exchanges to facilitate this communication.

- **rabbitmq-service:** Acts as the messaging backbone for inter-service communication.
- **comments, moderation, posts, query:** These microservices use RabbitMQ to exchange messages, coordinating their actions and ensuring data consistency.
