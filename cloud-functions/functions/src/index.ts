import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger"; // v2 logger
import * as functions from "firebase-functions"; // For HttpsError
import axios from "axios";


export const fetchTwitterFollowers = onCall(async (data) => {
  
  const { userId } = data.data; // Only expect the userId from the client

  // Log incoming request data
  logger.info("Received Twitter followers request", { userId });

  // Parameter validation
  if (!userId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required parameter: userId");
  }

  const url = `https://api.x.com/1.1/users/show.json?user_id=${userId}`;

  console.log("^_^ ~ file: index.ts:22 ~ fetchTwitterFollowers ~ url:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAKqJNwEAAAAALhXtgNt0HtoWTBCtmeUA1uXDI54%3DsyWpQ1kpOT63VyJcRrppaYwQ1IZAecEVHnZw7Qa33gBgzG8bsn`, // Use the Bearer Token from the environment
      },
    });

    logger.info("Followers data fetched successfully", { followers: response.data });
    return { followers: response.data };
  } catch (error) {
    logger.error("Error fetching Twitter followers:", error);
    throw new functions.https.HttpsError("unknown", "Error fetching Twitter followers");
  }
});