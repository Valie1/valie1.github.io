"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MousePointer2 } from "lucide-react";
import OnePageVideoShowcase from "@/components/OnePageVideoShowcase";
import PortfolioImage from "@/components/PortfolioImage";
import { getProjectWebsiteUrl } from "@/lib/content";
import type { Project, ProjectCategory } from "@/lib/content";

type Props = {
  longForm: Project[];
  shortForm: Project[];
  websites: Project[];
};

type WorkTab = ProjectCategory;

const tabs: Array<{ id: WorkTab; label: string; hash: string }> = [
  { id: "long", label: "YOUTUBE LONG FORM", hash: "long-form" },
  { id: "short", label: "SHORTS / REELS", hash: "short-form" },
  { id: "web", label: "WEBSITES", hash: "websites" },
];

function tabFromHash(hash: string): WorkTab | null {
  if (hash === "#short-form") return "short";
  if (hash === "#websites") return "web";
  if (hash === "#long-form" || hash === "#work") return "long";
  return null;
}

export default function UnifiedWorkShowcase({ longForm, shortForm, websites }: Props) {
  const [activeTab, setActiveTab] = useState<WorkTab>("long");
  const [visibleTab, setVisibleTab] = useState<WorkTab>("long");
  const [isSwitching, setIsSwitching] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const transitionId = useRef(0);
  const activeAnimation = useRef<Animation | null>(null);
  const firstHashSync = useRef(true);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const cancelStageAnimation = useCallback(() => {
    if (activeAnimation.current) {
      activeAnimation.current.cancel();
      activeAnimation.current = null;
    }
    stageRef.current?.getAnimations().forEach((animation) => animation.cancel());
  }, []);

  const animateStage = useCallback(
    async (keyframes: Keyframe[], options: KeyframeAnimationOptions, id: number) => {
      const stage = stageRef.current;
      if (!stage || typeof stage.animate !== "function") return true;

      cancelStageAnimation();
      const animation = stage.animate(keyframes, options);
      activeAnimation.current = animation;

      try {
        await animation.finished;
      } catch {

      }

      if (activeAnimation.current === animation) activeAnimation.current = null;
      return transitionId.current === id;
    },
    [cancelStageAnimation],
  );

  const transitionToTab = useCallback(
    async (nextTab: WorkTab, animate = true) => {
      const id = ++transitionId.current;
      setActiveTab(nextTab);

      if (!animate || nextTab === visibleTab) {
        cancelStageAnimation();
        setVisibleTab(nextTab);
        setIsSwitching(false);
        return;
      }

      setIsSwitching(true);


      const stage = stageRef.current;
      const computed = stage ? window.getComputedStyle(stage) : null;
      const parsedOpacity = computed ? Number.parseFloat(computed.opacity || "1") : 1;
      const currentOpacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 1;
      const currentTransform = computed?.transform && computed.transform !== "none"
        ? computed.transform
        : "translate3d(0,0,0) scale(1)";
      const currentFilter = computed?.filter && computed.filter !== "none"
        ? computed.filter
        : "blur(0px)";

      const exited = await animateStage(
        [
          { opacity: currentOpacity, transform: currentTransform, filter: currentFilter },
          { opacity: 0, transform: "translate3d(0,-12px,0) scale(.997)", filter: "blur(1.5px)" },
        ],
        {
          duration: 280,
          easing: "cubic-bezier(.4,0,.2,1)",
          fill: "forwards",
        },
        id,
      );
      if (!exited) return;


      flushSync(() => setVisibleTab(nextTab));
      if (transitionId.current !== id) return;


      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });
      if (transitionId.current !== id) return;


      const entered = await animateStage(
        [
          { opacity: 0, transform: "translate3d(0,14px,0) scale(.997)", filter: "blur(1.5px)" },
          { opacity: 1, transform: "translate3d(0,2px,0) scale(1)", filter: "blur(0px)", offset: 0.72 },
          { opacity: 1, transform: "translate3d(0,0,0) scale(1)", filter: "blur(0px)" },
        ],
        {
          duration: 440,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "both",
        },
        id,
      );
      if (!entered) return;

      cancelStageAnimation();
      setIsSwitching(false);
    },
    [animateStage, cancelStageAnimation, visibleTab],
  );

  const syncFromHash = useCallback(() => {
    const nextTab = tabFromHash(window.location.hash);
    if (!nextTab) return;
    void transitionToTab(nextTab, !firstHashSync.current);
    firstHashSync.current = false;
  }, [transitionToTab]);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  useEffect(
    () => () => {
      transitionId.current += 1;
      cancelStageAnimation();
    },
    [cancelStageAnimation],
  );

  const selectTab = (tab: WorkTab, hash: string) => {
    if (tab === activeTab && !isSwitching) return;
    void transitionToTab(tab, true);
    const url = `${window.location.pathname}${window.location.search}#${hash}`;
    window.history.replaceState(null, "", url);
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const next = tabs[nextIndex];
    tabRefs.current[nextIndex]?.focus({ preventScroll: true });
    selectTab(next.id, next.hash);
  };

  return (
    <section className="one-section one-media-section unified-work" aria-labelledby="selected-work-title">
      <h2 id="selected-work-title" className="sr-only">Selected work</h2>
      <span id="work" className="one-anchor-target unified-work-anchor" aria-hidden="true" />
      <span id="long-form" className="unified-work-anchor" aria-hidden="true" />
      <span id="short-form" className="unified-work-anchor" aria-hidden="true" />
      <span id="websites" className="unified-work-anchor" aria-hidden="true" />

      <div className="unified-work-tabs" role="tablist" aria-label="Work categories">
        {tabs.map((tab, index) => (
          <button
            type="button"
            ref={(node) => { tabRefs.current[index] = node; }}
            id={`work-tab-${tab.id}`}
            key={tab.id}
            className={activeTab === tab.id ? "is-active" : ""}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="work-tabpanel"
            tabIndex={activeTab === tab.id ? 0 : -1}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            onClick={() => selectTab(tab.id, tab.hash)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div
        ref={stageRef}
        id="work-tabpanel"
        className="unified-work-stage"
        role="tabpanel"
        aria-labelledby={`work-tab-${activeTab}`}
        aria-busy={isSwitching}
      >
        {visibleTab === "long" ? <OnePageVideoShowcase projects={longForm} /> : null}
        {visibleTab === "short" ? <OnePageVideoShowcase projects={shortForm} vertical /> : null}
        {visibleTab === "web" ? (
          <div className="unified-work-websites">
            <div className="one-web-grid">
              {websites.map((project, index) => {
                const liveUrl = getProjectWebsiteUrl(project);
                if (!liveUrl) return null;
                const domain = liveUrl.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

                return (
                  <a
                    className="one-web-card"
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={project.slug}
                    aria-label={`Open ${project.title} live website in a new tab`}
                  >
                    <PortfolioImage
                      src={project.media.hero}
                      alt={`${project.title} website thumbnail`}
                      className="one-web-card__image"
                      sizes="(max-width: 760px) 100vw, 33vw"
                      priority={index === 0}
                    />
                    <span className="one-web-card__shade" aria-hidden="true" />
                    <span className="one-web-card__open" aria-hidden="true">
                      <span className="one-web-card__click-ring" />
                      <MousePointer2 className="one-web-card__cursor" size={21} strokeWidth={1.8} />
                    </span>
                    <span className="one-web-card__copy">
                      <strong>{project.title}</strong>
                      <small>{domain}</small>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
