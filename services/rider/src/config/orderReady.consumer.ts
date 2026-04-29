import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import { Rider } from "../model/Rider.js";

export const startOrderReadyConsumer = async () => {
  const channel = getChannel();

  console.log(
    "Starting to consume from",
    process.env.ORDER_READY_QUEUE!.trim(),
  );

  channel.consume(process.env.ORDER_READY_QUEUE!.trim(), async (msg) => {
    if (!msg) return;

    try {
      console.log("Received msg:", msg.content.toString());
      const event = JSON.parse(msg.content.toString());

      console.log("Event type:", event.type);

      if (event.type !== "ORDER_READY_FOR_RIDER") {
        console.log("Skipping non-order-ready-for-rider event");
        channel.ack(msg);
        return;
      }

      const { orderId, restaurantId, location } = event.data;
      console.log("orderId", orderId);
      console.log("restaurantId", restaurantId);
      console.log("location", location);
      console.log("Searching for the rider near", location);

      const riders = await Rider.find({
        isAvailable: true,
        isVerified: true,
        location: {
          $near: {
            $geometry: location,
            $maxDistance: 500000,
          },
        },
      });

      console.log(`Found ${riders.length} riders near the restaurant`);

      if (riders.length === 0) {
        console.log("No Rider avaliable nearby");
        channel.ack(msg);
        return;
      }

      // fetching every riders under 500m and sending them the realtime notification using socket.io =>

      for (const rider of riders) {
        console.log("Notifying rider with ID", rider.userId);

        try {
          await axios.post(
            `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
            {
              event: "order:available",
              room: `user:${rider.userId}`,
              payload: { orderId, restaurantId },
            },
            {
              headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
              },
            },
          );
          console.log("Notified rider with ID", rider.userId);
        } catch (error) {
          console.log(`Failed to notified rider ${rider.userId}`);
        }
      }

      channel.ack(msg);
      console.log(`Message acknoledged for order ${orderId}`);
    } catch (error) {
      console.log(`order_ready_for_rider consumer error :`, error);
    }
  });
};
