import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!.trim());

  channel = await connection.createChannel();

  await channel.assertQueue(process.env.PAYMENT_QUEUE!.trim(), {
    durable: true,
  });

  await channel.assertQueue(process.env.RIDER_QUEUE!.trim(), {
    durable: true,
  });

  console.log("RabbitMQ Connected Successfully🐇");
};

export const getChannel = () => channel;
