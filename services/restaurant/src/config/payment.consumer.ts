import axios from "axios";
import Order from "../models/Order.js";
import { getChannel } from "./rabbitmq.js";

export const startPaymentConsumer = async () => {
  const channel = getChannel();

  channel.consume(process.env.PAYMENT_QUEUE!.trim(), async (msg) => {
    if (!msg) {
      return;
    }

    try {
      const event = JSON.parse(msg.content.toString());

      if (event.type !== "PAYMENT_SUCCESS") {
        channel.ack(msg);
        return;
      }

      const { orderId } = event.data;

      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            status: "preparing",
          },
          $unset: {
            expireAt: 1, //now the order not delete
          },
        },
        { new: true },
      );

      if (!order) {
        channel.ack(msg);
        return;
      }

      console.log("✅Order placed:", order._id);

      //socket here=>
      await axios.post(
        `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
        {
          event: "order:new",
          room: `restaurant:${order.restaurantId}`,
          payload: {
            orderId:order._id,
          },
        },
        {
          headers: {
            "x-internal-key": `${process.env.INTERNAL_SERVICE_KEY}`,
          },
        },
      );

      channel.ack(msg);
    } catch (error) {
      console.error("❌Error in payment consumer:", error);
    }
  });
};
