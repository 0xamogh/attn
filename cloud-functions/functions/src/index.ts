import { TwitterApi } from 'twitter-api-v2';
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const fetchTwitterFollowers = onCall(async (data) => {
  console.log("^_^ ~ file: index.ts:9 ~ fetchTwitterFollowers ~ data.data:", data.data);

  //@ts-ignore
    const { twitterUserName, uid } = data.data; // Expecting twitterUserName and uid from client
    console.log("^_^ ~ file: index.ts:11 ~ fetchTwitterFollowers ~ twitterUserName, uid:", twitterUserName, uid);


  const twitterClient = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAKqJNwEAAAAAIoE9z52ryK7KuSVuVrYsNjpbwdU%3D8XJ8J6kaWPpnz6H1dsgOkCBNCtJr8jX8biEL8AIsSV9tludwQf');
  const readOnlyClient = twitterClient.readOnly;

  try {
    // Fetch user data from Twitter API
    const userResponse = await readOnlyClient.v2.userByUsername(twitterUserName, {
      'user.fields': [
        'created_at',
        'description',
        'entities',
        'id',
        'location',
        'name',
        'pinned_tweet_id',
        'profile_image_url',
        'protected',
        'public_metrics',
        'url',
        'username',
        'verified',
        'verified_type',
        'withheld',
      ],
    });

    const userData = userResponse.data;
    console.log("^_^ ~ file: index.ts:40 ~ fetchTwitterFollowers ~ userData:", userData);


    // Prepare data to store in Firestore
    const userInfo = {
twitterInfo : {      name: userData.name,
      username: userData.username,
      createdAt: userData.created_at,
      description: userData.description,
      profileImageUrl: userData.profile_image_url,
      verified: userData.verified,
      verifiedType: userData.verified_type,
      publicMetrics: {
        followersCount: userData.public_metrics.followers_count,
        followingCount: userData.public_metrics.following_count,
        tweetCount: userData.public_metrics.tweet_count,
        listedCount: userData.public_metrics.listed_count,
        likeCount: userData.public_metrics.like_count, // If present in API response
      },
      url: userData.url,
      protected: userData.protected,
}    };

    // Store or update the user info in Firestore
    await db.collection('users').doc(uid).set(userInfo, { merge: true });

    return { success: true, message: 'User data successfully fetched and stored' };
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return { success: false, message: 'Failed to fetch Twitter data', error: error.message };
  }
});