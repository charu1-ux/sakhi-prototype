"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Format = "T20" | "ODI" | "Test";
type MatchState = "live" | "completed";
type Tab = "live" | "scorecard";

type BatterRow = {
  name: string;
  status: string;
  r: number;
  b: number;
  min?: number;
  fours: number;
  sixes: number;
  sr: number;
};
type BowlerRow = {
  name: string;
  o: number;
  m: number;
  r: number;
  w: number;
  eco: number;
  nb?: number;
  wd?: number;
};
type FowRow = { score: string; batter: string; over: string };
type InningsData = {
  tabLabel: string;
  team: string;
  flag: string;
  battingTitle: string;
  bowlingTitle: string;
  total: string;
  batting: BatterRow[];
  dnb?: string[];
  extras: string;
  bowling: BowlerRow[];
  fow: FowRow[];
};

// ── Innings data ──────────────────────────────────────────────────────────────

// Shared: AUS 1st innings (T20) — same in live and completed
const AUS_T20_INN: InningsData = {
  tabLabel: "AUS · 177/6",
  team: "AUS",
  flag: "🇦🇺",
  battingTitle: "Australia Batting",
  bowlingTitle: "India Bowling",
  total: "177/6 (20.0 Ovs)",
  batting: [
    { name: "D Warner", status: "c Kohli b Bumrah", r: 42, b: 28, fours: 5, sixes: 2, sr: 150.0 },
    { name: "A Finch*", status: "b Shami", r: 15, b: 12, fours: 1, sixes: 0, sr: 125.0 },
    { name: "S Smith", status: "not out", r: 62, b: 44, fours: 4, sixes: 3, sr: 140.9 },
    {
      name: "M Labuschagne",
      status: "c Jadeja b Kumar",
      r: 12,
      b: 9,
      fours: 1,
      sixes: 0,
      sr: 133.3,
    },
    { name: "G Maxwell", status: "c Pandya b Bumrah", r: 28, b: 15, fours: 1, sixes: 2, sr: 186.7 },
    { name: "T David", status: "not out", r: 14, b: 8, fours: 1, sixes: 1, sr: 175.0 },
  ],
  dnb: ["A Carey†", "P Cummins", "M Starc", "J Hazlewood", "A Zampa"],
  extras: "4 (lb2, w2)",
  bowling: [
    { name: "J Bumrah", o: 4, m: 0, r: 22, w: 3, eco: 5.5 },
    { name: "M Shami", o: 4, m: 0, r: 36, w: 1, eco: 9.0 },
    { name: "R Jadeja", o: 4, m: 0, r: 38, w: 1, eco: 9.5 },
    { name: "A Kumar", o: 3, m: 0, r: 27, w: 1, eco: 9.0 },
    { name: "H Pandya", o: 2, m: 0, r: 28, w: 0, eco: 14.0 },
    { name: "A Sharma", o: 3, m: 0, r: 26, w: 0, eco: 8.7 },
  ],
  fow: [
    { score: "24/1", batter: "Warner", over: "4.2" },
    { score: "46/2", batter: "Finch", over: "7.4" },
    { score: "65/3", batter: "Labuschagne", over: "10.1" },
    { score: "133/4", batter: "Maxwell", over: "16.3" },
  ],
};

// IND 2nd innings — live (in progress)
const IND_T20_INN_LIVE: InningsData = {
  tabLabel: "IND · 156/4*",
  team: "IND",
  flag: "🇮🇳",
  battingTitle: "India Batting",
  bowlingTitle: "Australia Bowling",
  total: "156/4* (17.3 Ovs)",
  batting: [
    {
      name: "R Sharma",
      status: "c Maxwell b Cummins",
      r: 34,
      b: 22,
      fours: 4,
      sixes: 2,
      sr: 154.5,
    },
    { name: "S Gill", status: "lbw b Starc", r: 12, b: 9, fours: 1, sixes: 0, sr: 133.3 },
    { name: "V Kohli*", status: "batting", r: 67, b: 43, fours: 8, sixes: 2, sr: 155.8 },
    { name: "S Iyer", status: "c Inglis b Hazlewood", r: 8, b: 6, fours: 1, sixes: 0, sr: 133.3 },
    { name: "H Pandya", status: "batting", r: 23, b: 15, fours: 2, sixes: 1, sr: 153.3 },
  ],
  dnb: ["R Jadeja", "D Karthik†", "A Sharma", "J Bumrah", "M Shami", "A Kumar"],
  extras: "12 (lb4, w8)",
  bowling: [
    { name: "P Cummins", o: 3, m: 0, r: 28, w: 1, eco: 9.3 },
    { name: "M Starc", o: 4, m: 0, r: 38, w: 1, eco: 9.5 },
    { name: "J Hazlewood", o: 4, m: 0, r: 32, w: 1, eco: 8.0 },
    { name: "A Zampa", o: 4, m: 0, r: 29, w: 1, eco: 7.25 },
    { name: "M Maxwell", o: 2, m: 0, r: 19, w: 0, eco: 9.5 },
  ],
  fow: [
    { score: "42/1", batter: "Sharma", over: "5.3" },
    { score: "58/2", batter: "Gill", over: "8.1" },
    { score: "69/3", batter: "Iyer", over: "9.2" },
    { score: "133/4", batter: "—", over: "16.2" },
  ],
};

// IND 2nd innings — completed
const IND_T20_INN_DONE: InningsData = {
  tabLabel: "IND · 189/4",
  team: "IND",
  flag: "🇮🇳",
  battingTitle: "India Batting",
  bowlingTitle: "Australia Bowling",
  total: "189/4 (20.0 Ovs)",
  batting: [
    {
      name: "R Sharma",
      status: "c Maxwell b Cummins",
      r: 34,
      b: 22,
      fours: 4,
      sixes: 2,
      sr: 154.5,
    },
    { name: "S Gill", status: "lbw b Starc", r: 12, b: 9, fours: 1, sixes: 0, sr: 133.3 },
    { name: "V Kohli*", status: "not out", r: 89, b: 54, fours: 3, sixes: 4, sr: 164.8 },
    { name: "S Iyer", status: "c Inglis b Hazlewood", r: 8, b: 6, fours: 1, sixes: 0, sr: 133.3 },
    { name: "H Pandya", status: "c Smith b Zampa", r: 40, b: 23, fours: 2, sixes: 3, sr: 173.9 },
  ],
  dnb: ["R Jadeja", "D Karthik†", "A Sharma", "J Bumrah", "M Shami", "A Kumar"],
  extras: "6 (lb1, w5)",
  bowling: [
    { name: "P Cummins", o: 4, m: 0, r: 38, w: 1, eco: 9.5 },
    { name: "M Starc", o: 4, m: 0, r: 42, w: 1, eco: 10.5 },
    { name: "J Hazlewood", o: 4, m: 0, r: 32, w: 1, eco: 8.0 },
    { name: "A Zampa", o: 4, m: 0, r: 37, w: 1, eco: 9.25 },
    { name: "M Maxwell", o: 4, m: 0, r: 34, w: 0, eco: 8.5 },
  ],
  fow: [
    { score: "42/1", batter: "Sharma", over: "5.3" },
    { score: "58/2", batter: "Gill", over: "8.1" },
    { score: "69/3", batter: "Iyer", over: "9.2" },
    { score: "147/4", batter: "Pandya", over: "16.3" },
  ],
};

// ── ODI innings ───────────────────────────────────────────────────────────────

const SL_ODI_INN: InningsData = {
  tabLabel: "SL · 231/8",
  team: "SL",
  flag: "🇱🇰",
  battingTitle: "Sri Lanka Batting",
  bowlingTitle: "India Bowling",
  total: "231/8 (50.0 Ovs)",
  batting: [
    { name: "P de Silva", status: "lbw b Bumrah", r: 45, b: 67, fours: 5, sixes: 0, sr: 67.2 },
    { name: "K Mendis*", status: "c Rohit b Shami", r: 78, b: 89, fours: 8, sixes: 1, sr: 87.6 },
    { name: "C de Silva", status: "b Ashwin", r: 28, b: 34, fours: 2, sixes: 1, sr: 82.4 },
    { name: "D de Silva", status: "c Kohli b Ashwin", r: 18, b: 22, fours: 1, sixes: 1, sr: 81.8 },
    {
      name: "S Chandimal†",
      status: "run out (Jadeja)",
      r: 34,
      b: 45,
      fours: 3,
      sixes: 0,
      sr: 75.6,
    },
    { name: "W Hasaranga", status: "c Sharma b Bumrah", r: 8, b: 12, fours: 0, sixes: 0, sr: 66.7 },
    { name: "D Chameera", status: "not out", r: 12, b: 9, fours: 1, sixes: 0, sr: 133.3 },
  ],
  dnb: ["M Theekshana", "N Pradeep", "L Madushanka"],
  extras: "8 (lb3, w4, nb1)",
  bowling: [
    { name: "J Bumrah", o: 10, m: 0, r: 42, w: 2, eco: 4.2 },
    { name: "M Shami", o: 8, m: 0, r: 48, w: 1, eco: 6.0 },
    { name: "R Jadeja", o: 10, m: 0, r: 38, w: 2, eco: 3.8 },
    { name: "R Ashwin", o: 10, m: 1, r: 38, w: 2, eco: 3.8 },
    { name: "H Pandya", o: 4, m: 0, r: 32, w: 0, eco: 8.0 },
    { name: "M Siraj", o: 8, m: 0, r: 33, w: 1, eco: 4.1 },
  ],
  fow: [
    { score: "78/1", batter: "de Silva", over: "17.3" },
    { score: "134/2", batter: "Mendis", over: "28.2" },
    { score: "168/3", batter: "C.deSilva", over: "35.4" },
    { score: "189/4", batter: "D.deSilva", over: "40.2" },
    { score: "198/5", batter: "Chandimal", over: "43.1" },
    { score: "218/6", batter: "Hasaranga", over: "47.3" },
  ],
};

const IND_ODI_INN_LIVE: InningsData = {
  tabLabel: "IND · 156/2*",
  team: "IND",
  flag: "🇮🇳",
  battingTitle: "India Batting",
  bowlingTitle: "Sri Lanka Bowling",
  total: "156/2* (28.4 Ovs)",
  batting: [
    { name: "R Sharma*", status: "batting", r: 72, b: 78, fours: 7, sixes: 2, sr: 92.3 },
    { name: "S Dhawan", status: "c Mendis b Chameera", r: 34, b: 42, fours: 3, sixes: 1, sr: 81.0 },
    { name: "V Kohli", status: "batting", r: 44, b: 51, fours: 4, sixes: 0, sr: 86.3 },
  ],
  dnb: ["S Iyer", "H Pandya", "R Pant†", "R Jadeja", "R Ashwin", "J Bumrah", "M Shami", "M Siraj"],
  extras: "6 (lb2, w4)",
  bowling: [
    { name: "D Chameera", o: 8, m: 0, r: 42, w: 1, eco: 5.25 },
    { name: "W Hasaranga", o: 6, m: 0, r: 24, w: 0, eco: 4.0 },
    { name: "M Theekshana", o: 8, m: 0, r: 36, w: 0, eco: 4.5 },
    { name: "N Pradeep", o: 4, m: 0, r: 28, w: 1, eco: 7.0 },
    { name: "C de Silva", o: 2, m: 0, r: 20, w: 0, eco: 10.0 },
  ],
  fow: [{ score: "78/1", batter: "Dhawan", over: "16.4" }],
};

const IND_ODI_INN_DONE: InningsData = {
  tabLabel: "IND · 232/3",
  team: "IND",
  flag: "🇮🇳",
  battingTitle: "India Batting",
  bowlingTitle: "Sri Lanka Bowling",
  total: "232/3 (44.2 Ovs)",
  batting: [
    { name: "R Sharma*", status: "not out", r: 112, b: 98, fours: 11, sixes: 2, sr: 114.3 },
    { name: "S Dhawan", status: "c Mendis b Chameera", r: 34, b: 42, fours: 3, sixes: 1, sr: 81.0 },
    { name: "V Kohli", status: "not out", r: 68, b: 78, fours: 6, sixes: 1, sr: 87.2 },
  ],
  dnb: ["S Iyer", "H Pandya", "R Pant†", "R Jadeja", "R Ashwin", "J Bumrah", "M Shami", "M Siraj"],
  extras: "18 (b5, lb8, w5)",
  bowling: [
    { name: "D Chameera", o: 8, m: 0, r: 48, w: 1, eco: 6.0 },
    { name: "W Hasaranga", o: 10, m: 0, r: 42, w: 0, eco: 4.2 },
    { name: "M Theekshana", o: 10, m: 1, r: 38, w: 0, eco: 3.8 },
    { name: "N Pradeep", o: 8, m: 0, r: 48, w: 1, eco: 6.0 },
    { name: "C de Silva", o: 6, m: 0, r: 40, w: 0, eco: 6.7 },
    { name: "L Madushanka", o: 2, m: 0, r: 16, w: 0, eco: 8.0 },
  ],
  fow: [{ score: "78/1", batter: "Dhawan", over: "16.4" }],
};

// ── Test innings ──────────────────────────────────────────────────────────────

const ENG_TEST_INN1: InningsData = {
  tabLabel: "ENG 1st · 289",
  team: "ENG",
  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  battingTitle: "England Batting",
  bowlingTitle: "India Bowling",
  total: "289 all out (92.4 Ovs)",
  batting: [
    {
      name: "Z Crawley",
      status: "c Pant b Bumrah",
      r: 24,
      b: 38,
      min: 54,
      fours: 3,
      sixes: 0,
      sr: 63.2,
    },
    { name: "B Duckett", status: "b Siraj", r: 42, b: 56, min: 78, fours: 6, sixes: 0, sr: 75.0 },
    {
      name: "O Pope",
      status: "c Kohli b Ashwin",
      r: 18,
      b: 34,
      min: 52,
      fours: 2,
      sixes: 0,
      sr: 52.9,
    },
    {
      name: "J Root",
      status: "lbw b Jadeja",
      r: 67,
      b: 89,
      min: 124,
      fours: 8,
      sixes: 1,
      sr: 75.3,
    },
    {
      name: "H Brook",
      status: "c Sharma b Ashwin",
      r: 29,
      b: 44,
      min: 62,
      fours: 3,
      sixes: 1,
      sr: 65.9,
    },
    {
      name: "B Stokes*",
      status: "c Pant b Bumrah",
      r: 35,
      b: 58,
      min: 84,
      fours: 4,
      sixes: 1,
      sr: 60.3,
    },
    { name: "B Foakes†", status: "b Ashwin", r: 22, b: 38, min: 55, fours: 2, sixes: 0, sr: 57.9 },
    { name: "M Wood", status: "lbw b Bumrah", r: 8, b: 12, min: 18, fours: 1, sixes: 0, sr: 66.7 },
    {
      name: "S Broad",
      status: "c Gill b Ashwin",
      r: 12,
      b: 24,
      min: 34,
      fours: 1,
      sixes: 0,
      sr: 50.0,
    },
    { name: "O Robinson", status: "not out", r: 8, b: 18, min: 28, fours: 1, sixes: 0, sr: 44.4 },
    { name: "J Anderson", status: "b Shami", r: 4, b: 8, min: 14, fours: 0, sixes: 0, sr: 50.0 },
  ],
  extras: "20 (b8, lb7, w3, nb2)",
  bowling: [
    { name: "J Bumrah", o: 22, m: 4, r: 58, w: 3, nb: 2, wd: 1, eco: 2.6 },
    { name: "M Shami", o: 18, m: 2, r: 64, w: 1, nb: 0, wd: 0, eco: 3.6 },
    { name: "R Ashwin", o: 28, m: 6, r: 82, w: 4, nb: 0, wd: 1, eco: 2.9 },
    { name: "R Jadeja", o: 18, m: 3, r: 54, w: 1, nb: 0, wd: 1, eco: 3.0 },
    { name: "M Siraj", o: 6, m: 0, r: 24, w: 1, nb: 0, wd: 0, eco: 4.0 },
  ],
  fow: [
    { score: "44/1", batter: "Crawley", over: "12.4" },
    { score: "98/2", batter: "Duckett", over: "28.3" },
    { score: "122/3", batter: "Pope", over: "36.1" },
    { score: "172/4", batter: "Brook", over: "52.4" },
    { score: "212/5", batter: "Root", over: "64.2" },
    { score: "238/6", batter: "Stokes", over: "74.5" },
    { score: "258/7", batter: "Foakes", over: "82.3" },
    { score: "268/8", batter: "Wood", over: "86.1" },
    { score: "281/9", batter: "Broad", over: "90.4" },
    { score: "289/10", batter: "Anderson", over: "92.4" },
  ],
};

const IND_TEST_INN_LIVE: InningsData = {
  tabLabel: "IND 2nd · 342/7*",
  team: "IND",
  flag: "🇮🇳",
  battingTitle: "India Batting",
  bowlingTitle: "England Bowling",
  total: "342/7* (98.2 Ovs)",
  batting: [
    {
      name: "R Sharma",
      status: "c Foakes b Wood",
      r: 32,
      b: 58,
      min: 82,
      fours: 4,
      sixes: 0,
      sr: 55.2,
    },
    {
      name: "S Gill",
      status: "lbw b Anderson",
      r: 12,
      b: 28,
      min: 38,
      fours: 2,
      sixes: 0,
      sr: 42.9,
    },
    {
      name: "C Pujara",
      status: "c Duckett b Stokes",
      r: 89,
      b: 168,
      min: 234,
      fours: 11,
      sixes: 0,
      sr: 53.0,
    },
    {
      name: "V Kohli",
      status: "c Root b Broad",
      r: 62,
      b: 112,
      min: 158,
      fours: 7,
      sixes: 2,
      sr: 55.4,
    },
    {
      name: "S Iyer",
      status: "lbw b Robinson",
      r: 28,
      b: 52,
      min: 74,
      fours: 3,
      sixes: 0,
      sr: 53.8,
    },
    { name: "R Pant†*", status: "batting", r: 68, b: 72, min: 98, fours: 8, sixes: 3, sr: 94.4 },
    { name: "R Jadeja", status: "batting", r: 32, b: 48, min: 62, fours: 3, sixes: 1, sr: 66.7 },
  ],
  dnb: ["R Ashwin", "S Thakur", "J Bumrah", "M Shami"],
  extras: "19 (b7, lb6, w4, nb2)",
  bowling: [
    { name: "J Anderson", o: 24, m: 5, r: 62, w: 1, nb: 1, wd: 0, eco: 2.6 },
    { name: "S Broad", o: 22, m: 3, r: 78, w: 1, nb: 0, wd: 0, eco: 3.5 },
    { name: "B Stokes", o: 18, m: 2, r: 56, w: 1, nb: 1, wd: 1, eco: 3.1 },
    { name: "O Robinson", o: 18, m: 2, r: 64, w: 1, nb: 0, wd: 2, eco: 3.6 },
    { name: "M Wood", o: 12, m: 1, r: 52, w: 2, nb: 0, wd: 1, eco: 4.3 },
    { name: "J Root", o: 4, m: 0, r: 18, w: 1, nb: 0, wd: 0, eco: 4.5 },
  ],
  fow: [
    { score: "24/1", batter: "Gill", over: "8.4" },
    { score: "62/2", batter: "Sharma", over: "22.1" },
    { score: "148/3", batter: "Pujara", over: "48.3" },
    { score: "218/4", batter: "Kohli", over: "68.2" },
    { score: "262/5", batter: "Iyer", over: "80.4" },
    { score: "342/6", batter: "Jadeja", over: "98.2" },
  ],
};

const IND_TEST_INN_DONE: InningsData = {
  tabLabel: "IND 1st · 482/8d",
  team: "IND",
  flag: "🇮🇳",
  battingTitle: "India Batting",
  bowlingTitle: "England Bowling",
  total: "482/8d (118.4 Ovs)",
  batting: [
    {
      name: "R Sharma",
      status: "c Foakes b Wood",
      r: 32,
      b: 58,
      min: 82,
      fours: 4,
      sixes: 0,
      sr: 55.2,
    },
    {
      name: "S Gill",
      status: "lbw b Anderson",
      r: 12,
      b: 28,
      min: 38,
      fours: 2,
      sixes: 0,
      sr: 42.9,
    },
    {
      name: "C Pujara",
      status: "c Duckett b Stokes",
      r: 113,
      b: 208,
      min: 289,
      fours: 14,
      sixes: 0,
      sr: 54.3,
    },
    {
      name: "V Kohli",
      status: "c Root b Broad",
      r: 72,
      b: 128,
      min: 182,
      fours: 8,
      sixes: 2,
      sr: 56.3,
    },
    {
      name: "S Iyer",
      status: "lbw b Robinson",
      r: 34,
      b: 64,
      min: 88,
      fours: 4,
      sixes: 0,
      sr: 53.1,
    },
    {
      name: "R Pant†",
      status: "c Foakes b Wood",
      r: 89,
      b: 92,
      min: 128,
      fours: 11,
      sixes: 4,
      sr: 96.7,
    },
    { name: "R Jadeja", status: "b Anderson", r: 28, b: 42, min: 58, fours: 3, sixes: 1, sr: 66.7 },
    {
      name: "R Ashwin",
      status: "c Brook b Broad",
      r: 62,
      b: 76,
      min: 104,
      fours: 7,
      sixes: 2,
      sr: 81.6,
    },
    { name: "S Thakur", status: "not out", r: 14, b: 22, min: 32, fours: 1, sixes: 0, sr: 63.6 },
  ],
  dnb: ["J Bumrah", "M Shami"],
  extras: "26 (b10, lb8, w5, nb3)",
  bowling: [
    { name: "J Anderson", o: 28, m: 5, r: 82, w: 2, nb: 2, wd: 0, eco: 2.9 },
    { name: "S Broad", o: 26, m: 3, r: 88, w: 2, nb: 0, wd: 1, eco: 3.4 },
    { name: "B Stokes", o: 22, m: 2, r: 72, w: 1, nb: 1, wd: 1, eco: 3.3 },
    { name: "O Robinson", o: 22, m: 2, r: 74, w: 1, nb: 0, wd: 2, eco: 3.4 },
    { name: "M Wood", o: 14, m: 1, r: 78, w: 2, nb: 0, wd: 1, eco: 5.6 },
    { name: "J Root", o: 6, m: 0, r: 28, w: 0, nb: 0, wd: 0, eco: 4.7 },
  ],
  fow: [
    { score: "24/1", batter: "Gill", over: "8.4" },
    { score: "62/2", batter: "Sharma", over: "22.1" },
    { score: "188/3", batter: "Pujara", over: "56.3" },
    { score: "274/4", batter: "Kohli", over: "78.2" },
    { score: "318/5", batter: "Iyer", over: "88.4" },
    { score: "394/6", batter: "Pant", over: "102.1" },
    { score: "422/7", batter: "Jadeja", over: "110.3" },
    { score: "482/8", batter: "Ashwin", over: "118.4" },
  ],
};

const ENG_TEST_INN2: InningsData = {
  tabLabel: "ENG 2nd · 156",
  team: "ENG",
  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  battingTitle: "England Batting",
  bowlingTitle: "India Bowling",
  total: "156 all out (48.2 Ovs)",
  batting: [
    { name: "Z Crawley", status: "b Bumrah", r: 12, b: 18, min: 28, fours: 2, sixes: 0, sr: 66.7 },
    {
      name: "B Duckett",
      status: "c Pant b Ashwin",
      r: 4,
      b: 8,
      min: 12,
      fours: 0,
      sixes: 0,
      sr: 50.0,
    },
    {
      name: "O Pope",
      status: "c Sharma b Ashwin",
      r: 28,
      b: 34,
      min: 48,
      fours: 3,
      sixes: 0,
      sr: 82.4,
    },
    { name: "J Root", status: "lbw b Bumrah", r: 22, b: 34, min: 52, fours: 2, sixes: 0, sr: 64.7 },
    {
      name: "H Brook",
      status: "c Kohli b Ashwin",
      r: 34,
      b: 42,
      min: 58,
      fours: 4,
      sixes: 1,
      sr: 81.0,
    },
    {
      name: "B Stokes*",
      status: "c Jadeja b Bumrah",
      r: 15,
      b: 22,
      min: 34,
      fours: 2,
      sixes: 0,
      sr: 68.2,
    },
    {
      name: "B Foakes†",
      status: "lbw b Ashwin",
      r: 8,
      b: 14,
      min: 22,
      fours: 1,
      sixes: 0,
      sr: 57.1,
    },
    {
      name: "M Wood",
      status: "c Pant b Bumrah",
      r: 12,
      b: 18,
      min: 26,
      fours: 1,
      sixes: 0,
      sr: 66.7,
    },
    { name: "J Anderson", status: "b Ashwin", r: 4, b: 8, min: 12, fours: 0, sixes: 0, sr: 50.0 },
    { name: "S Broad", status: "not out", r: 11, b: 24, min: 34, fours: 1, sixes: 0, sr: 45.8 },
    { name: "O Robinson", status: "lbw b Bumrah", r: 0, b: 2, min: 4, fours: 0, sixes: 0, sr: 0.0 },
  ],
  extras: "6 (b2, lb2, w2)",
  bowling: [
    { name: "J Bumrah", o: 14, m: 3, r: 42, w: 5, nb: 0, wd: 1, eco: 3.0 },
    { name: "R Ashwin", o: 18, m: 4, r: 48, w: 4, nb: 0, wd: 0, eco: 2.7 },
    { name: "R Jadeja", o: 10, m: 2, r: 34, w: 1, nb: 0, wd: 1, eco: 3.4 },
    { name: "M Shami", o: 6, m: 1, r: 24, w: 0, nb: 0, wd: 0, eco: 4.0 },
    { name: "S Thakur", o: 0.2, m: 0, r: 2, w: 0, nb: 0, wd: 0, eco: 6.0 },
  ],
  fow: [
    { score: "12/1", batter: "Crawley", over: "4.2" },
    { score: "18/2", batter: "Duckett", over: "6.4" },
    { score: "48/3", batter: "Root", over: "14.2" },
    { score: "68/4", batter: "Pope", over: "20.4" },
    { score: "92/5", batter: "Brook", over: "28.1" },
    { score: "108/6", batter: "Stokes", over: "32.3" },
    { score: "122/7", batter: "Foakes", over: "36.4" },
    { score: "142/8", batter: "Wood", over: "43.2" },
    { score: "154/9", batter: "Anderson", over: "47.4" },
    { score: "156/10", batter: "Robinson", over: "48.2" },
  ],
};

// ── Scorecard matrix: Format × MatchState → innings list ─────────────────────

const SCORECARD: Record<Format, Record<MatchState, InningsData[]>> = {
  T20: {
    live: [AUS_T20_INN, IND_T20_INN_LIVE],
    completed: [AUS_T20_INN, IND_T20_INN_DONE],
  },
  ODI: {
    live: [SL_ODI_INN, IND_ODI_INN_LIVE],
    completed: [SL_ODI_INN, IND_ODI_INN_DONE],
  },
  Test: {
    live: [ENG_TEST_INN1, IND_TEST_INN_LIVE],
    completed: [ENG_TEST_INN1, IND_TEST_INN_DONE, ENG_TEST_INN2],
  },
};

// ── Completed match hero data ─────────────────────────────────────────────────

const COMPLETED_HERO: Record<
  Format,
  {
    team1: string;
    team1Flag: string;
    team1Score: string;
    team1Overs?: string;
    team2: string;
    team2Flag: string;
    team2Score: string;
    team2Overs?: string;
    result: string;
  }
> = {
  T20: {
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "189/4",
    team1Overs: "20.0",
    team2: "AUS",
    team2Flag: "🇦🇺",
    team2Score: "177/6",
    team2Overs: "20.0",
    result: "India won by 6 runs",
  },
  ODI: {
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "232/3",
    team1Overs: "44.2",
    team2: "SL",
    team2Flag: "🇱🇰",
    team2Score: "231/8",
    team2Overs: "50.0",
    result: "India won by 7 wickets",
  },
  Test: {
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "482/8d",
    team2: "ENG",
    team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    team2Score: "289 & 156",
    result: "India won by an innings and 37 runs",
  },
};

// ── Summary data ──────────────────────────────────────────────────────────────

type SummaryData = {
  potm: string;
  potmStat: string;
  potmFlag: string;
  topBatter: string;
  topBatterStat: string;
  topBowler: string;
  topBowlerStat: string;
  moments: { over: string; text: string }[];
};

const SUMMARY: Record<Format, SummaryData> = {
  T20: {
    potm: "V Kohli",
    potmStat: "89*(54) · 3×4 · 4×6",
    potmFlag: "🇮🇳",
    topBatter: "V Kohli",
    topBatterStat: "89*(54) · SR 164.8",
    topBowler: "J Bumrah",
    topBowlerStat: "4-0-22-3 · Eco 5.5",
    moments: [
      { over: "17.4", text: "Kohli six overtakes AUS total for the first time" },
      { over: "19.1", text: "Bumrah removes Maxwell — AUS last hope gone" },
      { over: "20.0", text: "Pandya hits the winning boundary · India win by 6 runs" },
    ],
  },
  ODI: {
    potm: "R Sharma",
    potmStat: "112*(98) · 11×4 · 2×6",
    potmFlag: "🇮🇳",
    topBatter: "R Sharma",
    topBatterStat: "112*(98) · SR 114.3",
    topBowler: "R Ashwin",
    topBowlerStat: "10-1-38-2 · Eco 3.8",
    moments: [
      { over: "13.2", text: "Rohit reaches century off 88 balls — fastest of this series" },
      { over: "22.0", text: "Ashwin back-to-back wickets triggers Sri Lanka collapse" },
      { over: "44.2", text: "Pandya drives Hasaranga — India win with 34 balls to spare" },
    ],
  },
  Test: {
    potm: "R Ashwin",
    potmStat: "9 wickets · 62 runs",
    potmFlag: "🇮🇳",
    topBatter: "C Pujara",
    topBatterStat: "113 (208b) · 14×4",
    topBowler: "R Ashwin",
    topBowlerStat: "9/130 across 2 innings",
    moments: [
      { over: "Day 2", text: "Ashwin takes 5/58 — England bowled out for 289 in 1st innings" },
      { over: "Day 3", text: "India post 482/8d — lead of 193 runs before declaring" },
      { over: "Day 4", text: "Bumrah 5-fer wraps England 2nd innings for 156 — win by innings" },
    ],
  },
};

// ── Ball data ─────────────────────────────────────────────────────────────────

type Ball = { type: "dot" | "run" | "four" | "six" | "wicket" | "wide" | "nb"; val: string };
const LAST_6: Ball[] = [
  { type: "run", val: "1" },
  { type: "wicket", val: "W" },
  { type: "four", val: "4" },
  { type: "dot", val: "0" },
  { type: "six", val: "6" },
  { type: "run", val: "1" },
];
const RECENT_OVERS = [
  { over: 12, runs: 8 },
  { over: 13, runs: 14 },
  { over: 14, runs: 6 },
  { over: 15, runs: 18 },
  { over: 16, runs: 11 },
  { over: 17, runs: 9 },
];

const BALL_STYLES: Record<Ball["type"], string> = {
  dot: "bg-surface-ghost text-[rgba(12,13,16,0.55)]",
  run: "bg-secondary-20 text-secondary-50",
  four: "bg-sparkle-20 text-sparkle-50",
  six: "bg-primary-50 text-white",
  wicket: "bg-error text-white",
  wide: "bg-[#fef0e6] text-[#f06d0f]",
  nb: "bg-[#fef0e6] text-[#f06d0f]",
};

function BallDot({ ball }: { ball: Ball }) {
  return (
    <div
      className={`text-label-l font-jio flex size-9 items-center justify-center rounded-full ${BALL_STYLES[ball.type]}`}
    >
      {ball.val}
    </div>
  );
}

// ── Phase label ───────────────────────────────────────────────────────────────

function phaseLabel(format: Format, overs: number): string {
  if (format === "Test") return "";
  if (format === "T20") {
    if (overs <= 6) return "Powerplay";
    if (overs <= 15) return "Middle overs";
    return "Death overs";
  }
  if (overs <= 10) return "Powerplay";
  if (overs <= 40) return "Middle overs";
  return "Death overs";
}

// ── Score hero ────────────────────────────────────────────────────────────────

function ScoreHero({ format, matchState }: { format: Format; matchState: MatchState }) {
  if (matchState === "completed") {
    const d = COMPLETED_HERO[format];
    const isTest = format === "Test";
    return (
      <div className="bg-bg-panel flex flex-col gap-3 rounded-2xl px-4 py-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">{d.team2Flag}</span>
            <span className="font-jio text-[13px] font-bold text-white/50">{d.team2}</span>
            <span className="ml-auto text-[13px] font-medium text-white/50">{d.team2Score}</span>
            {!isTest && d.team2Overs && (
              <span className="text-[11px] text-white/30">({d.team2Overs})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">{d.team1Flag}</span>
            <span className="font-jio text-[15px] font-bold text-white">{d.team1}</span>
            {isTest ? (
              <span className="ml-auto text-[15px] font-bold text-white">{d.team1Score}</span>
            ) : (
              <>
                <span className="ml-auto text-[22px] leading-none font-bold text-white">
                  {d.team1Score}
                </span>
                {d.team1Overs && (
                  <span className="text-[13px] font-medium text-white/50">({d.team1Overs})</span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl bg-[#25ab21]/[0.18] px-3 py-2.5">
          <span className="font-jio text-[13px] font-bold text-[#25ab21]">{d.result}</span>
        </div>
      </div>
    );
  }

  if (format === "Test") {
    return (
      <div className="bg-bg-panel flex flex-col gap-3 rounded-2xl px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-overline font-jio rounded-full bg-white/10 px-2.5 py-1 text-white/60">
            Day 2 · Session 2
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="bg-error absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-error relative inline-flex size-2 rounded-full" />
            </span>
            <span className="text-overline font-jio text-error font-bold">Live</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
            <span className="font-jio text-[13px] font-bold text-white/50">ENG</span>
            <span className="ml-1 text-[13px] font-medium text-white/50">289</span>
            <span className="ml-1 text-[11px] text-white/30">(92.4)</span>
            <span className="text-overline font-jio ml-auto font-bold text-white/30">
              1st Innings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🇮🇳</span>
            <span className="font-jio text-[15px] font-bold text-white">IND</span>
            <span className="ml-1 text-[22px] font-bold text-white">342/7</span>
            <span className="ml-1 text-[13px] font-medium text-white/50">(98.2)</span>
            <span className="text-overline font-jio ml-auto font-bold text-[#25ab21]">Batting</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2">
          <span className="font-jio text-[12px] font-bold text-white">IND lead by 53 runs</span>
          <span className="ml-auto text-[11px] font-medium text-white/40">
            Today: 89 runs, 3 wkts
          </span>
        </div>
      </div>
    );
  }

  const isODI = format === "ODI";
  return (
    <div className="bg-bg-panel flex flex-col gap-3 rounded-2xl px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🇮🇳</span>
          <span className="font-jio text-[13px] font-bold text-white/60">IND</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] leading-none font-bold tracking-tight text-white">
            {isODI ? "156/2" : "156/4"}
          </span>
          <span className="text-[14px] font-medium text-white/50">
            {isODI ? "(28.4)" : "(17.3)"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="bg-error absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-error relative inline-flex size-2 rounded-full" />
          </span>
          <span className="text-overline font-jio text-error font-bold">Live</span>
        </div>
      </div>
      <div className="h-px bg-white/[0.08]" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-overline font-jio text-white/35">Target</span>
          <span className="text-[15px] font-bold text-white">{isODI ? "232" : "178"}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-overline font-jio text-white/35">Need</span>
          <span className="text-[15px] font-bold text-white">
            {isODI ? "76 off 129" : "22 off 15"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-overline font-jio text-white/35">RRR</span>
          <span className="text-[15px] font-bold text-[#f06d0f]">{isODI ? "3.5" : "8.8"}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-overline font-jio text-white/35">CRR</span>
          <span className="text-[15px] font-bold text-[#25ab21]">{isODI ? "5.4" : "8.9"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-overline font-jio rounded-full bg-white/10 px-2.5 py-1 text-white/60">
          {phaseLabel(format, isODI ? 28 : 17)}
        </span>
        <span className="ml-auto text-[11px] font-medium text-white/35">
          {isODI ? "🇱🇰 SL set 231/8" : "🇦🇺 AUS set 177/6"}
        </span>
      </div>
    </div>
  );
}

// ── Summary view ──────────────────────────────────────────────────────────────

function SummaryView({ format }: { format: Format }) {
  const d = SUMMARY[format];
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white p-4">
        <span className="text-overline font-jio mb-3 block text-[rgba(12,13,16,0.38)]">
          Player of the Match
        </span>
        <div className="flex items-center gap-3">
          <div className="bg-primary-20 flex size-12 shrink-0 items-center justify-center rounded-full text-2xl">
            {d.potmFlag}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-title-s font-jio text-[#0c0d10]">{d.potm}</div>
            <div className="text-body-2xs text-[rgba(12,13,16,0.55)]">{d.potmStat}</div>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <span className="text-overline font-jio mb-3 block text-[rgba(12,13,16,0.38)]">
          Top Performers
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-sparkle-20 text-label-s font-jio text-sparkle-50 shrink-0 rounded-full px-2 py-0.5">
              BAT
            </span>
            <span className="text-label-l font-jio text-[#0c0d10]">{d.topBatter}</span>
            <span className="text-body-2xs ml-auto text-[rgba(12,13,16,0.55)]">
              {d.topBatterStat}
            </span>
          </div>
          <div className="h-px bg-[rgba(12,13,16,0.06)]" />
          <div className="flex items-center gap-2">
            <span className="bg-secondary-20 text-label-s font-jio text-secondary-50 shrink-0 rounded-full px-2 py-0.5">
              BOWL
            </span>
            <span className="text-label-l font-jio text-[#0c0d10]">{d.topBowler}</span>
            <span className="text-body-2xs ml-auto text-[rgba(12,13,16,0.55)]">
              {d.topBowlerStat}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <span className="text-overline font-jio mb-3 block text-[rgba(12,13,16,0.38)]">
          Key Moments
        </span>
        <div className="flex flex-col gap-3">
          {d.moments.map((m, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="bg-primary-20 text-label-s font-jio text-primary-50 mt-0.5 shrink-0 rounded-full px-2 py-0.5">
                {m.over}
              </span>
              <span className="text-body-2xs leading-snug text-[rgba(12,13,16,0.55)]">
                {m.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Live view ─────────────────────────────────────────────────────────────────

const LIVE_CURRENT_BOWLER = { name: "P Cummins", o: 3, m: 0, r: 28, w: 1, eco: 9.3 };
const LIVE_BATTERS = [
  { name: "V Kohli*", r: 67, b: 43, fours: 8, sixes: 2, sr: 155.8 },
  { name: "H Pandya", r: 23, b: 15, fours: 2, sixes: 1, sr: 153.3 },
];

function LiveView() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <span className="text-overline font-jio text-[rgba(12,13,16,0.38)]">
          {LIVE_CURRENT_BOWLER.name} — Over {Math.floor(17.3) + 1}
        </span>
        <div className="flex items-center gap-2">
          {LAST_6.map((b, i) => (
            <BallDot key={i} ball={b} />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="px-4 pt-3 pb-2">
          <span className="text-overline font-jio text-[rgba(12,13,16,0.38)]">Batting</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(12,13,16,0.06)]">
              <th className="text-overline font-jio px-4 pb-2 text-left text-[rgba(12,13,16,0.3)]">
                Batter
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                R
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                B
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                4s
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                6s
              </th>
              <th className="text-overline font-jio px-4 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                SR
              </th>
            </tr>
          </thead>
          <tbody>
            {LIVE_BATTERS.map((b, i) => (
              <tr key={b.name} className="border-b border-[rgba(12,13,16,0.04)] last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="text-title-2xs font-jio text-[#0c0d10]">{b.name}</span>
                    {i === 0 && <span className="text-primary-50 text-[10px] font-bold">★</span>}
                  </div>
                </td>
                <td className="font-jio px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                  {b.r}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.b}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.fours}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.sixes}
                </td>
                <td className="text-label-s font-jio text-sparkle-50 px-4 py-2.5 text-right">
                  {b.sr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="px-4 pt-3 pb-2">
          <span className="text-overline font-jio text-[rgba(12,13,16,0.38)]">Bowling</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(12,13,16,0.06)]">
              <th className="text-overline font-jio px-4 pb-2 text-left text-[rgba(12,13,16,0.3)]">
                Bowler
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                O
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                R
              </th>
              <th className="text-overline font-jio px-2 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                W
              </th>
              <th className="text-overline font-jio px-4 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                Eco
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-title-2xs font-jio text-[#0c0d10]">
                    {LIVE_CURRENT_BOWLER.name}
                  </span>
                  <span className="bg-primary-20 font-jio text-primary-50 rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                    Now
                  </span>
                </div>
              </td>
              <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                {LIVE_CURRENT_BOWLER.o}
              </td>
              <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                {LIVE_CURRENT_BOWLER.r}
              </td>
              <td className="font-jio px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                {LIVE_CURRENT_BOWLER.w}
              </td>
              <td className="text-label-s font-jio text-error px-4 py-2.5 text-right">
                {LIVE_CURRENT_BOWLER.eco}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <span className="text-overline font-jio text-[rgba(12,13,16,0.38)]">Recent overs</span>
        <div className="flex h-12 items-end gap-2">
          {RECENT_OVERS.map((o) => (
            <div key={o.over} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="bg-primary-50/20 w-full rounded-sm"
                style={{ height: `${Math.round((o.runs / 18) * 40)}px` }}
              />
              <span className="text-[9px] font-bold text-[rgba(12,13,16,0.3)]">{o.runs}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {RECENT_OVERS.map((o) => (
            <span key={o.over} className="flex-1 text-center text-[9px] text-[rgba(12,13,16,0.25)]">
              Ov {o.over}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Single innings card ───────────────────────────────────────────────────────

function InningsCard({ inn, isTest }: { inn: InningsData; isTest: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Batting table */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="bg-surface-minimal flex items-center justify-between px-4 py-2.5">
          <span className="text-title-2xs font-jio text-[#0c0d10]">{inn.battingTitle}</span>
          <span className="text-label-s font-jio text-[rgba(12,13,16,0.55)]">{inn.total}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(12,13,16,0.06)]">
              <th className="text-overline font-jio px-4 pt-2.5 pb-2 text-left text-[rgba(12,13,16,0.3)]">
                Batter
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                R
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                B
              </th>
              {isTest && (
                <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                  M
                </th>
              )}
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                4s
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                6s
              </th>
              <th className="text-overline font-jio px-4 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                SR
              </th>
            </tr>
          </thead>
          <tbody>
            {inn.batting.map((b) => (
              <tr key={b.name} className="border-b border-[rgba(12,13,16,0.04)] last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-title-2xs font-jio text-[#0c0d10]">{b.name}</span>
                    <span className="text-[10px] leading-tight font-medium text-[rgba(12,13,16,0.45)]">
                      {b.status}
                    </span>
                  </div>
                </td>
                <td className="font-jio px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                  {b.r}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.b}
                </td>
                {isTest && (
                  <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                    {"min" in b ? (b as { min: number }).min : "—"}
                  </td>
                )}
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.fours}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.sixes}
                </td>
                <td className="text-label-s font-jio text-sparkle-50 px-4 py-2.5 text-right">
                  {b.sr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Did Not Bat */}
        {inn.dnb && inn.dnb.length > 0 && (
          <div className="border-t border-[rgba(12,13,16,0.06)] px-4 py-2.5">
            <span className="text-overline font-jio text-[rgba(12,13,16,0.38)]">Did Not Bat </span>
            <span className="text-[11px] font-medium text-[rgba(12,13,16,0.55)]">
              {inn.dnb.join(", ")}
            </span>
          </div>
        )}
        {/* Extras + Total */}
        <div className="flex items-center justify-between border-t border-[rgba(12,13,16,0.06)] px-4 py-2.5">
          <span className="text-body-2xs text-[rgba(12,13,16,0.55)]">Extras</span>
          <span className="text-body-2xs text-[rgba(12,13,16,0.55)]">{inn.extras}</span>
        </div>
        <div className="bg-surface-minimal flex items-center justify-between border-t border-[rgba(12,13,16,0.06)] px-4 py-2.5">
          <span className="text-label-l font-jio text-[#0c0d10]">Total</span>
          <span className="text-label-l font-jio text-[#0c0d10]">{inn.total}</span>
        </div>
      </div>

      {/* Bowling table */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="bg-surface-minimal px-4 py-2.5">
          <span className="text-title-2xs font-jio text-[#0c0d10]">{inn.bowlingTitle}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(12,13,16,0.06)]">
              <th className="text-overline font-jio px-4 pt-2.5 pb-2 text-left text-[rgba(12,13,16,0.3)]">
                Bowler
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                O
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                M
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                R
              </th>
              <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                W
              </th>
              {isTest && (
                <>
                  <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                    NB
                  </th>
                  <th className="text-overline font-jio px-2 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                    WD
                  </th>
                </>
              )}
              <th className="text-overline font-jio px-4 pt-2.5 pb-2 text-right text-[rgba(12,13,16,0.3)]">
                Eco
              </th>
            </tr>
          </thead>
          <tbody>
            {inn.bowling.map((b) => (
              <tr key={b.name} className="border-b border-[rgba(12,13,16,0.04)] last:border-0">
                <td className="text-title-2xs font-jio px-4 py-2.5 text-[#0c0d10]">{b.name}</td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.o}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.m}
                </td>
                <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.55)]">
                  {b.r}
                </td>
                <td className="font-jio px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                  {b.w}
                </td>
                {isTest && (
                  <>
                    <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.38)]">
                      {b.nb ?? 0}
                    </td>
                    <td className="text-body-2xs px-2 py-2.5 text-right text-[rgba(12,13,16,0.38)]">
                      {b.wd ?? 0}
                    </td>
                  </>
                )}
                <td
                  className={`text-label-s font-jio px-4 py-2.5 text-right ${
                    b.eco > 9 ? "text-error" : b.eco < 6 ? "text-[#25ab21]" : "text-[#f06d0f]"
                  }`}
                >
                  {b.eco}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fall of wickets */}
      {inn.fow.length > 0 && (
        <div className="rounded-2xl bg-white p-4">
          <span className="text-overline font-jio mb-2.5 block text-[rgba(12,13,16,0.38)]">
            Fall of Wickets
          </span>
          <div className="flex flex-col gap-1.5">
            {inn.fow.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-jio w-5 text-center text-[10px] font-bold text-[rgba(12,13,16,0.3)]">
                  {i + 1}.
                </span>
                <span className="text-label-l font-jio text-[#0c0d10]">{f.score}</span>
                <span className="text-body-2xs text-[rgba(12,13,16,0.55)]">{f.batter}</span>
                <span className="text-body-2xs ml-auto text-[rgba(12,13,16,0.38)]">
                  Ov {f.over}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scorecard view ─────────────────────────────────────────────────────────────

function ScorecardView({
  innings,
  allInnings,
  onInningsChange,
  isTest,
}: {
  innings: number;
  allInnings: InningsData[];
  onInningsChange: (i: number) => void;
  isTest: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Innings tabs */}
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {allInnings.map((inn, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onInningsChange(i)}
            className={`text-label-s font-jio focus-visible:ring-primary-60 shrink-0 rounded-full px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
              innings === i
                ? "bg-primary-50 text-white"
                : "bg-surface-ghost text-[rgba(12,13,16,0.55)]"
            }`}
          >
            {inn.tabLabel}
          </button>
        ))}
      </div>

      <InningsCard inn={allInnings[innings]} isTest={isTest} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CricketScorecardPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [format, setFormat] = useState<Format>("T20");
  const [matchState, setMatchState] = useState<MatchState>("live");
  const [innings, setInnings] = useState(0);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const handleMatchStateChange = (s: MatchState) => {
    setMatchState(s);
    setInnings(0);
    setActiveTab(s === "completed" ? "scorecard" : "live");
  };

  const handleFormatChange = (f: Format) => {
    setFormat(f);
    setInnings(0);
  };

  const allInnings = SCORECARD[format][matchState];
  const isTest = format === "Test";

  const tabs = [
    { id: "live" as Tab, label: matchState === "completed" ? "Summary" : "🔴 Live" },
    { id: "scorecard" as Tab, label: "Scorecard" },
  ];

  const matchMeta = {
    T20: "3rd T20I · India tour of Australia · Hyderabad",
    ODI: "3rd ODI · Sri Lanka tour of India · Mumbai",
    Test: "2nd Test · India vs England · Edgbaston",
  }[format];

  const headerTitle = {
    T20: "IND vs AUS · T20I",
    ODI: "IND vs SL · ODI",
    Test: "IND vs ENG · Test",
  }[format];

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4">
          {/* Match meta */}
          <p className="pt-1 text-[11px] font-medium text-[rgba(12,13,16,0.38)]">{matchMeta}</p>

          {/* Demo controls */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {(["T20", "ODI", "Test"] as Format[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFormatChange(f)}
                  className={`text-label-s font-jio focus-visible:ring-primary-60 rounded-full px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
                    format === f
                      ? "bg-[#0c0d10] text-white"
                      : "bg-surface-ghost text-[rgba(12,13,16,0.55)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-1.5">
              {(["live", "completed"] as MatchState[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleMatchStateChange(s)}
                  className={`text-label-s font-jio focus-visible:ring-primary-60 rounded-full px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
                    matchState === s
                      ? s === "live"
                        ? "bg-error text-white"
                        : "bg-[#0c0d10] text-white"
                      : "bg-surface-ghost text-[rgba(12,13,16,0.55)]"
                  }`}
                >
                  {s === "live" ? "Live" : "Done"}
                </button>
              ))}
            </div>
          </div>

          {/* Score hero */}
          <ScoreHero format={format} matchState={matchState} />

          {/* Tab toggle */}
          <div className="bg-surface-ghost flex gap-1 rounded-2xl p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`text-label-l font-jio focus-visible:ring-primary-60 flex-1 rounded-xl py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
                  activeTab === t.id ? "bg-[#0c0d10] text-white" : "text-[rgba(12,13,16,0.38)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "live" ? (
            matchState === "completed" ? (
              <SummaryView format={format} />
            ) : (
              <LiveView />
            )
          ) : (
            <ScorecardView
              innings={innings}
              allInnings={allInnings}
              onInningsChange={setInnings}
              isTest={isTest}
            />
          )}
        </div>
      </main>

      <HubHeader title={headerTitle} backHref="/cricket" scrolled={scrolled} />
      <HubChatInput variant="sleek" placeholder="Ask about this match…" />
    </div>
  );
}
