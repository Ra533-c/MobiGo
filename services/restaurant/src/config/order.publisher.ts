import { getChannel } from "./rabbitmq.js";

const publishEvent = async (type: string, data: any) => {
  const channel = getChannel();

  channel.sendToQueue(
    process.env.ORDER_READY_QUEUE!.trim(),
    Buffer.from(JSON.stringify({ type, data })),
    { persistent: true },
  );

  console.log(`Event ${type} published to queue ${process.env.ORDER_READY_QUEUE!.trim()} with data ${JSON.stringify(data)}`);

};

export default publishEvent;