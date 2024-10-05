import { Playfair_Display, DM_Sans as Open_Sans } from "next/font/google";


export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"], // Specify font weights
});

export const open = Open_Sans({
  subsets: ["latin"],
  weight: ["400"], // Specify font weights
});
