import { BASE_PATH } from "@/lib/base-path";
import { JOBS_APP_BASE_PATH } from "@/lib/jobs-app-base-path";

export { JOBS_APP_BASE_PATH };

// Asset paths (used as <Image>/img string src) must carry the app basePath —
// the router prefixes navigation, but not static public/ asset references.
export const DESIGN_ASSETS_PREFIX = `${BASE_PATH}${JOBS_APP_BASE_PATH}/assets/design-assets`;
export const HOME_ASSETS = `${DESIGN_ASSETS_PREFIX}/home`;
export const MICROLEARN_ASSETS = `${DESIGN_ASSETS_PREFIX}/microlearn`;

export type HubCard = {
  title: string;
  subtitle: string;
  thumbnail: string;
  href?: string;
};

export type SkillEarned = {
  name: string;
  date: string;
  iconSrc: string;
  href?: string;
};

export const SKILLS_EARNED: SkillEarned[] = [
  {
    name: "Thumbnail hooks",
    date: "Apr 28, 2026",
    iconSrc: `${HOME_ASSETS}/image-thumbnail.svg`,
    href: `${JOBS_APP_BASE_PATH}/design-prototype/microlearning/creator/?resume=true`,
  },
  { name: "ChatGPT Prompting", date: "Apr 28, 2026", iconSrc: `${HOME_ASSETS}/sparkle.svg` },
  { name: "ChatGPT Prompting", date: "Apr 28, 2026", iconSrc: `${HOME_ASSETS}/sparkle.svg` },
];

export const HUB_CARDS: HubCard[] = [
  {
    title: "Micro Learning",
    subtitle: "मेरा थंबनेल क्लिक क्यों नहीं हो रहा है?",
    thumbnail: `${HOME_ASSETS}/micro-learning.png`,
    href: `${JOBS_APP_BASE_PATH}/design-prototype/microlearning/`,
  },
  {
    title: "English learning",
    subtitle: "सर प्लीज़ बोलने से आगे कुछ नहीं आता?",
    thumbnail: `${HOME_ASSETS}/english-learning.png`,
  },
  {
    title: "Interview prep",
    subtitle: "वी एंड ए राउंड में फ्रीज हो जाता हूं",
    thumbnail: `${HOME_ASSETS}/interview-prep.png`,
  },
  {
    title: "Govt. exams and prep",
    subtitle: "वी एंड ए राउंड में फ्रीज हो जाता हूं",
    thumbnail: `${HOME_ASSETS}/govt-exams.png`,
  },
];
