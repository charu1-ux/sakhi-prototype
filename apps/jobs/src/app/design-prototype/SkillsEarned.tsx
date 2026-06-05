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
      <div
        className="rounded-xl bg-white p-3 flex flex-col gap-3"
        style={{ border: "1px solid #F0F0F0" }}
      >
        {SKILLS_EARNED.map((skill, idx) => (
          <Fragment key={idx}>
            {idx > 0 && (
              <hr className="m-0 h-px border-none" style={{ backgroundColor: "#F5F5F5" }} />
            )}
            <div
              className="flex items-center justify-between gap-3"
              style={{ cursor: skill.href ? "pointer" : "default" }}
              onClick={() => {
                if (skill.href) window.location.href = skill.href;
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex shrink-0 items-center justify-center rounded-md bg-chip-surface p-2">
                  <Image
                    src={skill.iconSrc}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5"
                    unoptimized
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span
                    className="block truncate text-sm leading-normal tracking-[-0.28px]"
                    style={{ color: "#404040" }}
                  >
                    {skill.name}
                  </span>
                  <span className="block text-xs leading-normal" style={{ color: "#A3A3A3" }}>
                    {skill.date}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
