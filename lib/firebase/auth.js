import { getAuth, TwitterAuthProvider } from "firebase/auth";
import firebaseApp from './firebaseConfig';

const firebaseAuth = getAuth(firebaseApp);
export const provider = new TwitterAuthProvider();
export default firebaseAuth;