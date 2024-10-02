import { getFunctions } from "firebase/functions";
import firebaseApp from './firebaseConfig';

const db = getFunctions(firebaseApp);
export default db;