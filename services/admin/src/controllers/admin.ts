import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import {
  getRestaurantCollection,
  getRiderCollection,
} from "../utils/collection.js";

export const getPendingRestaurants = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection())
    .find({ isVerified: false })
    .toArray();

  res.json({
    count: restaurants.length,
    restaurants,
  });
});

export const getPendingRiders = TryCatch(async (req, res) => {
  const riders = await (
    await getRiderCollection()
  )
    .aggregate([
      { $match: { isVerified: false } },

      // STEP 1: Pehle userId (string) ko ObjectId me convert karo
      {
        $addFields: {
          convertedId: { $toObjectId: "$userId" },
        },
      },

      // STEP 2: Ab match karo convertedId aur _id ko
      {
        $lookup: {
          from: "users",
          localField: "convertedId", // Naya converted field use karo
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $addFields: {
          name: "$userDetails.name",
          email: "$userDetails.email",
        },
      },
      { $project: { userDetails: 0, convertedId: 0 } }, // Clean up
    ])
    .toArray();

    console.log("pending riders",riders);

  res.json({
    count: riders.length,
    riders,
  });
});

export const verifyRestaurant = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Invalid restaurant id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRestaurantCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }

  res.json({
    message: "Restaurant verified successfully",
    result,
  });
});

export const verifyRider = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Invalid rider id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRiderCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "Rider not found",
    });
  }

  res.json({
    message: "Rider verified successfully",
    result,
  });
});
