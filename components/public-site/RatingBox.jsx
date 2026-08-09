"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Star,
  X,
} from "lucide-react";

const DISMISS_KEY =
  "crtgo_rating_prompt_dismissed";

const DISMISS_DAYS = 7;

const MIN_TIME_ON_PAGE =
  25 * 1000;

const MIN_SCROLL_PERCENT = 55;

export default function RatingBox({
  projectId,
}) {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [average, setAverage] =
    useState(null);

  const [count, setCount] =
    useState(0);

  const [
    myRating,
    setMyRating,
  ] = useState(null);

  const [
    hoveredRating,
    setHoveredRating,
  ] = useState(null);

  const [
    selectedRating,
    setSelectedRating,
  ] = useState(null);

  const [
    completed,
    setCompleted,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const readyByTime =
    useRef(false);

  const readyByScroll =
    useRef(false);

  const automaticPromptShown =
    useRef(false);

  /*
   * ----------------------------------------
   * LOAD RATING STATE
   * ----------------------------------------
   */

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response =
          await fetch(
            `/api/ratings?projectId=${encodeURIComponent(
              projectId
            )}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load ratings"
          );
        }

        if (!active) {
          return;
        }

        setAverage(
          data.average
        );

        setCount(
          data.count || 0
        );

        setMyRating(
          data.myRating ||
            null
        );

        setSelectedRating(
          data.myRating ||
            null
        );
      } catch (err) {
        console.error(
          "[CRTGO ratings]",
          err
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [projectId]);

  /*
   * ----------------------------------------
   * SMART AUTO PROMPT
   * ----------------------------------------
   */

  useEffect(() => {
    if (loading) {
      return;
    }

    /*
     * Already rated?
     * Never automatically bother them.
     */
    if (myRating) {
      return;
    }

    /*
     * Recently dismissed?
     */
    if (
      wasRecentlyDismissed()
    ) {
      return;
    }

    function maybeOpen() {
      if (
        automaticPromptShown.current
      ) {
        return;
      }

      if (
        !readyByTime.current ||
        !readyByScroll.current
      ) {
        return;
      }

      automaticPromptShown.current =
        true;

      setOpen(true);
    }

    /*
     * They need to spend some actual
     * time with the restaurant first.
     */
    const timer =
      window.setTimeout(() => {
        readyByTime.current =
          true;

        maybeOpen();
      }, MIN_TIME_ON_PAGE);

    /*
     * They should also browse a meaningful
     * amount of the page.
     */
    function handleScroll() {
      const documentHeight =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      if (documentHeight <= 0) {
        return;
      }

      const percent =
        (window.scrollY /
          documentHeight) *
        100;

      if (
        percent >=
        MIN_SCROLL_PERCENT
      ) {
        readyByScroll.current =
          true;

        maybeOpen();

        window.removeEventListener(
          "scroll",
          handleScroll
        );
      }
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.clearTimeout(
        timer
      );

      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    loading,
    myRating,
  ]);

  /*
   * ----------------------------------------
   * LOCK SCROLL WHILE MODAL IS OPEN
   * ----------------------------------------
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event
    ) {
      if (
        event.key === "Escape"
      ) {
        closeModal();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previous;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  /*
   * ----------------------------------------
   * SAVE
   * ----------------------------------------
   */

  async function submitRating() {
    if (
      !selectedRating ||
      saving
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/ratings",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                projectId,

                rating:
                  selectedRating,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to save rating"
        );
      }

      setAverage(
        data.average
      );

      setCount(
        data.count || 0
      );

      setMyRating(
        data.myRating
      );

      setSelectedRating(
        data.myRating
      );

      setCompleted(true);

      window.setTimeout(
        () => {
          setOpen(false);
          setCompleted(false);
        },
        1700
      );
    } catch (err) {
      console.error(
        "[CRTGO rating save]",
        err
      );

      setError(
        "تعذر حفظ التقييم. حاول مرة أخرى."
      );
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setOpen(false);
    setCompleted(false);

    /*
     * Only remember dismissal if
     * they haven't rated.
     */
    if (!myRating) {
      rememberDismissal();
    }
  }

  /*
   * Can later be attached to a
   * "Rate this restaurant" button.
   */
  function openManually() {
    setSelectedRating(
      myRating || null
    );

    setCompleted(false);
    setError("");
    setOpen(true);
  }

  const previewRating =
    hoveredRating ||
    selectedRating ||
    0;

  return (
    <>
      {/*
       * Small rating summary.
       *
       * This is NOT the popup.
       * Clicking it manually opens
       * the rating interface.
       */}

      <button
        type="button"
        onClick={openManually}
        className="inline-flex items-center gap-2 text-sm font-bold"
      >

        {loading ? (
          <span className="opacity-40">
            ...
          </span>
        ) : count > 0 ? (
          <>
            <span>
              {Number(
                average
              ).toFixed(1)}
            </span>

            <span className="opacity-40">
              ({count})
            </span>
          </>
        ) : (
          <span className="opacity-45">
            قيّم تجربتك
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            fixed inset-0 z-[1000]
            flex items-end
            bg-black/45
            backdrop-blur-[3px]
            sm:items-center
            sm:justify-center
            sm:p-5
          "
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="تقييم تجربتك"
            className="
              relative
              w-full
              rounded-t-[32px]
              bg-white
              px-6
              pb-[max(28px,env(safe-area-inset-bottom))]
              pt-5
              text-black
              shadow-2xl

              sm:max-w-md
              sm:rounded-[32px]
              sm:p-7
            "
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-black/10 sm:hidden" />

            <button
              type="button"
              onClick={
                closeModal
              }
              aria-label="إغلاق"
              className="
                absolute
                left-4
                top-4
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black/[0.05]
                text-black/45
                transition
                hover:bg-black/10
                hover:text-black
              "
            >
              <X size={18} />
            </button>

            {completed ? (
              <ThankYouState
                rating={
                  myRating
                }
              />
            ) : (
              <>
                <div className="pt-4 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-black/30">
                    CRTGO
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                    كيف كانت تجربتك؟
                  </h2>

                  <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-black/45">
                    تقييمك يساعد المطعم
                    ويحسّن التجربة للآخرين.
                  </p>
                </div>

                <div
                  className="mx-auto mt-7 flex w-fit gap-1"
                  dir="ltr"
                  onMouseLeave={() =>
                    setHoveredRating(
                      null
                    )
                  }
                >
                  {[1, 2, 3, 4, 5].map(
                    (
                      value
                    ) => {
                      const active =
                        value <=
                        previewRating;

                      return (
                        <button
                          key={
                            value
                          }
                          type="button"
                          disabled={
                            saving
                          }
                          aria-label={`${value} stars`}
                          onMouseEnter={() =>
                            setHoveredRating(
                              value
                            )
                          }
                          onFocus={() =>
                            setHoveredRating(
                              value
                            )
                          }
                          onBlur={() =>
                            setHoveredRating(
                              null
                            )
                          }
                          onClick={() =>
                            setSelectedRating(
                              value
                            )
                          }
                          className="
                            p-1
                            transition
                            hover:scale-110
                            active:scale-95
                            disabled:opacity-50
                          "
                        >
                          <Star
                            size={
                              38
                            }
                            strokeWidth={
                              1.5
                            }
                            fill={
                              active
                                ? "currentColor"
                                : "transparent"
                            }
                            className={
                              active
                                ? "opacity-100"
                                : "opacity-20"
                            }
                          />
                        </button>
                      );
                    }
                  )}
                </div>

                {selectedRating && (
                  <p className="mt-3 text-center text-sm font-bold text-black/40">
                    {
                      getRatingLabel(
                        selectedRating
                      )
                    }
                  </p>
                )}

                {error && (
                  <p className="mt-4 text-center text-sm font-bold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={
                    !selectedRating ||
                    saving
                  }
                  onClick={
                    submitRating
                  }
                  className="
                    mt-7
                    flex
                    min-h-13
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-black
                    px-5
                    text-sm
                    font-black
                    text-white
                    transition
                    hover:opacity-85
                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
                >
                  {saving
                    ? "جارٍ الحفظ..."
                    : myRating
                      ? "تحديث التقييم"
                      : "إرسال التقييم"}
                </button>

                {!myRating && (
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="
                      mt-3
                      w-full
                      py-2
                      text-sm
                      font-bold
                      text-black/35
                      transition
                      hover:text-black
                    "
                  >
                    ربما لاحقاً
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function ThankYouState({
  rating,
}) {
  return (
    <div className="py-10 text-center">
      <div
        className="mx-auto flex w-fit gap-1"
        dir="ltr"
      >
        {[1, 2, 3, 4, 5].map(
          (value) => (
            <Star
              key={value}
              size={28}
              strokeWidth={1.5}
              fill={
                value <= rating
                  ? "currentColor"
                  : "transparent"
              }
              className={
                value <= rating
                  ? "opacity-100"
                  : "opacity-15"
              }
            />
          )
        )}
      </div>

      <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">
        شكراً لك ❤️
      </h2>

      <p className="mt-2 text-sm font-medium text-black/45">
        تم حفظ تقييمك.
      </p>
    </div>
  );
}

function getRatingLabel(
  rating
) {
  if (rating === 1) {
    return "سيئة";
  }

  if (rating === 2) {
    return "ليست جيدة";
  }

  if (rating === 3) {
    return "جيدة";
  }

  if (rating === 4) {
    return "رائعة";
  }

  if (rating === 5) {
    return "ممتازة!";
  }

  return "";
}

function wasRecentlyDismissed() {
  try {
    const value =
      localStorage.getItem(
        DISMISS_KEY
      );

    if (!value) {
      return false;
    }

    const dismissedAt =
      Number(value);

    if (
      !Number.isFinite(
        dismissedAt
      )
    ) {
      return false;
    }

    const days =
      DISMISS_DAYS *
      24 *
      60 *
      60 *
      1000;

    return (
      Date.now() -
        dismissedAt <
      days
    );
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now())
    );
  } catch {
    // Ignore storage errors.
  }
}