import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!.trim());

  channel = await connection.createChannel();

  // for payment queue
  await channel.assertQueue(process.env.PAYMENT_QUEUE!.trim(), { durable: true });

  // for rider queue(to get notification where rider is ?)
  await channel.assertQueue(process.env.RIDER_QUEUE!.trim(), { durable: true });

  // for order queue(to send msg to rider services)
  await channel.assertQueue(process.env.ORDER_READY_QUEUE!.trim(), { durable: true });

  console.log("Restaurant RabbitMQ Connected Successfully🐇");
};

export const getChannel = () => channel;
