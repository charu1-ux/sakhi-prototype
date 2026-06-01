"use client";

import Image from "next/image";
import { Fragment } from "react";

import { HOME_ASSETS, SKILLS_EARNED } from "./hub-data";

export function SkillsEarned() {
  return (
    <section className="flex flex-col gap-[11px]" aria-labelledby="skills-earned-heading">
      <h2
        id="skills-earned-heading"
        className="m-0 w-full text-base font-medium leading-normal text-black"
      >
        Skills you&apos;ve earned
      </h2>
      <div className="rounded-xl border border-[#f0f0f0] bg-white p-3 flex flex-col gap-3">
        {SKILLS_EARNED.map((skill, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <hr className="m-0 border-none h-px bg-[#f0f0f0]" />}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex shrink-0 items-center justify-center rounded-md bg-[#f0e8fa] p-2">
                  <Image
                    src={skill.iconSrc}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="block text-sm leading-normal text-[#1b0633] tracking-[-0.28px] truncate">
                    {skill.name}
                  </span>
                  <span className="block text-xs leading-normal text-[#b5b5b5]">{skill.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Image
                  src={`${HOME_ASSETS}/share.svg`}
                  alt="Share"
                  width={20}
                  height={20}
                  className="size-5"
                  unoptimized
                />
                <Image
                  src={`${HOME_ASSETS}/3-dot.svg`}
                  alt="More"
                  width={20}
                  height={20}
                  className="size-5"
                  unoptimized
                />
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
