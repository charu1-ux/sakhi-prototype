import { JOBS_APP_BASE_PATH } from "@/lib/jobs-app-base-path";

export const DESIGN_ASSETS_PREFIX = `${JOBS_APP_BASE_PATH}/assets/design-assets`;

export type HubCard = {
  title: string;
  subtitle: string;
  thumbnail: string;
  href: string;
};

export const HUB_CARDS: HubCard[] = [
  {
    title: "Micro Learning",
    subtitle: "मेरा थंबनेल क्लिक क्यों नहीं हो रहा है?",
    thumbnail: `${DESIGN_ASSETS_PREFIX}/micro-learning.png`,
    href: "/microlearning.html",
  },
  {
    title: "English learning",
    subtitle: "सर प्लीज़ बोलने से आगे कुछ नहीं आता?",
    thumbnail: `${DESIGN_ASSETS_PREFIX}/english-learning.png`,
    href: "/english.html",
  },
  {
    title: "Interview prep",
    subtitle: "वी एंड ए राउंड में फ्रीज हो जाता हूं",
    thumbnail: `${DESIGN_ASSETS_PREFIX}/interview-prep.png`,
    href: "/interview-prep.html",
  },
  {
    title: "Govt. exams and prep",
    subtitle: "वी एंड ए राउंड में फ्रीज हो जाता हूं",
    thumbnail: `${DESIGN_ASSETS_PREFIX}/govt-exams.png`,
    href: "/govt-exam.html",
  },
];
