import jwt from "jsonwebtoken";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import axios from "axios";

export const addRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      ownerId: user?._id,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        message: "You already have a restaurant",
      });
    }

    const { name, description, latitude, longitude, formattedAddress, phone } =
      req.body || {};

    if (!user || !latitude || !longitude) {
      return res.status(400).json({
        message: "Please give all details",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Please give Image",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to create file buffer",
      });
    }

    // it will work when someone hit http://localhost:5002/api/upload  endpoint
    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const restaurant = await Restaurant.create({
      name,
      description,
      phone,
      image: uploadResult.url,
      ownerId: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formattedAddress,
      },
      isVerified: false,
    });

    return res.status(200).json({
      message: "Restaurant craeted successfully",
      restaurant,
    });
  },
);

export const fetchMyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

    if (!restaurant) {
      return res.status(400).json({
        message: "No Restaurant Found",
      });
    }

    if (!req.user.restaurantId) {
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            restaurantId: restaurant._id,
          },
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "15d" },
      );
      //if user don't have restaurantId in token then send restaurant and token(where it contains restaurantId)
      return res.json({ restaurant, token });
    }
    //if user already have restaurantId in token then send only restaurant
    res.json({ restaurant });
  },
);

export const updateStatusRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Status must be boolean",
      });
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { ownerId: req.user._id },
      { isOpen: status },
      { new: true },
    );

    if (!restaurant) {
      return res.status(400).json({
        message: "No Restaurant Found",
      });
    }

    res.json({
      message: "Restaurant status updated successfully",
      restaurant,
    });
  },
);

export const updateRestuarant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    };

    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
      { ownerId: req.user._id },
      { name, description },
      { new: true },
    );

    if (!restaurant) {
      return res.status(400).json({
        message: "No Restaurant Found",
      });
    };

    res.json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  },
);

export const getNearbyRestaurant = TryCatch(async(req,res)=>{
  const {latitude,longitude,radius=5000,search=""} = req.query;

  if(!latitude || !longitude){
    return res.status(400).json({
      message:"Latitude and Longitude are required",
    });
  };

  const query:any = {
    // isVerified:true
  };

  if(search && typeof search === "string"){
    query.name = {$regex:search,$options:"i"};
  };

  const restaurants = await Restaurant.aggregate([
    {
      $geoNear:{
        near:{
          type:"Point",
          coordinates:[Number(longitude), Number(latitude)],
        },
        distanceField:"distance",
        maxDistance:Number(radius),
        spherical:true,
        query,
      },
    },
    {
      $sort:{
        isOpen:-1,
        distance:1,
      },
    },
    {
      $addFields:{
        distancekm:{
          $round:[{$divide:["$distance",1000]},2],
        },
      },
    },
  ]);

  res.json({
    success:true,
    count:restaurants.length,
    restaurants,
  });

});

export const fetchSingleRestuarant = TryCatch(async(req,res)=>{
  const restaurant = await Restaurant.findById(req.params.id);

  res.json({
    restaurant,
  });
})