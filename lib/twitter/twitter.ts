import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios, { AxiosRequestConfig } from 'axios';

// Function to fetch Twitter user information using user_id without include_entities
export const fetchTwitterUserInfoById = async (accessToken: string, tokenSecret: string, userId: string) => {
  const oauth = new OAuth({
    consumer: {
      key: process.env.TWITTER_API_KEY as string, // Your Twitter API key
      secret: process.env.TWITTER_API_SECRET as string, // Your Twitter API secret
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString: string, key: string) {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64');
    },
  });

  const token = {
    key: accessToken,
    secret: tokenSecret,
  };

  const url = `https://api.twitter.com/1.1/users/show.json`;
  
  // OAuth parameters and request data
  const request_data = {
    url: `${url}?user_id=${userId}`, // Request URL with user_id
    method: 'GET',
  };

  // Generate OAuth headers
  const oauthHeaders = oauth.toHeader(oauth.authorize(request_data, token));

  const config: AxiosRequestConfig = {
    headers: {
      ...oauthHeaders, // Spread the oauthHeaders object
    },
  };

  try {
    // Make the request to Twitter's API from the server
    const response = await axios.get(`${url}?user_id=${userId}`, config);

    // The response contains the user's Twitter information
    const userInfo = response.data;
    console.log('User Info:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('Error fetching Twitter user information:', error);
    throw error;
  }
};