import { httpsCallable } from 'firebase/functions';
import functions from '../../lib/firebase/functions'; // Assuming you have initialized Firebase and exported 'functions'

export const callFetchTwitterFollowers = async (twitterId: string, uid: string) => {
  const fetchTwitterFollowers = httpsCallable(functions, 'fetchTwitterFollowers');

  try {
    const result = await fetchTwitterFollowers({ twitterUserName: twitterId, uid: uid });
    console.log('Followers:', result.data); // Result contains followers list
    return result.data;
  } catch (error) {
    console.error('Error fetching Twitter followers:', error);
    throw error;
  }
};