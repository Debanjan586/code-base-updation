import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/libs/utils";

type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
}

interface Position {
  top: number;
  left: number;
  side: TooltipSide;
}

const VIEWPORT_MARGIN = 8;

const getPosition = (
  rect: DOMRect,
  side: TooltipSide,
  align: TooltipAlign,
  sideOffset: number,
  tooltipWidth: number,
  tooltipHeight: number
): Position => {
  const sides: TooltipSide[] =
    side === "top"
      ? ["top", "bottom", "right", "left"]
      : side === "bottom"
      ? ["bottom", "top", "right", "left"]
      : side === "left"
      ? ["left", "right", "top", "bottom"]
      : ["right", "left", "top", "bottom"];

  const fits = (candidate: TooltipSide) => {
    switch (candidate) {
      case "top":
        return rect.top - sideOffset - tooltipHeight >= VIEWPORT_MARGIN;
      case "bottom":
        return (
          rect.bottom + sideOffset + tooltipHeight <=
          window.innerHeight - VIEWPORT_MARGIN
        );
      case "left":
        return rect.left - sideOffset - tooltipWidth >= VIEWPORT_MARGIN;
      case "right":
        return (
          rect.right + sideOffset + tooltipWidth <=
          window.innerWidth - VIEWPORT_MARGIN
        );
    }
  };

  const resolvedSide = sides.find(fits) ?? side;

  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  let top = rect.top - tooltipHeight - sideOffset;

  if (resolvedSide === "bottom") {
    top = rect.bottom + sideOffset;
  } else if (resolvedSide === "left") {
    left = rect.left - tooltipWidth - sideOffset;
    top = rect.top + rect.height / 2 - tooltipHeight / 2;
  } else if (resolvedSide === "right") {
    left = rect.right + sideOffset;
    top = rect.top + rect.height / 2 - tooltipHeight / 2;
  }

  if (resolvedSide === "top" || resolvedSide === "bottom") {
    if (align === "start") left = rect.left;
    if (align === "end") left = rect.right - tooltipWidth;
  } else {
    if (align === "start") top = rect.top;
    if (align === "end") top = rect.bottom - tooltipHeight;
  }

  left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(left, window.innerWidth - tooltipWidth - VIEWPORT_MARGIN)
  );
  top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(top, window.innerHeight - tooltipHeight - VIEWPORT_MARGIN)
  );

  return { top, left, side: resolvedSide };
};

const Tooltip = ({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = 8,
  delayDuration = 200,
  disabled = false,
  className,
}: TooltipProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    side,
  });

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled || !content) return;

    clearTimers();
    openTimerRef.current = setTimeout(() => setOpen(true), delayDuration);
  }, [clearTimers, content, delayDuration, disabled]);

  const hideTooltip = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), 40);
  }, [clearTimers]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;

    if (!trigger || !tooltip) return;

    setPosition(
      getPosition(
        trigger.getBoundingClientRect(),
        side,
        align,
        sideOffset,
        tooltip.offsetWidth,
        tooltip.offsetHeight
      )
    );
  }, [align, side, sideOffset]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!React.isValidElement(children)) {
    return null;
  }

  const child = children as React.ReactElement<Record<string, unknown>>;
  const existingRef = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> })
    .ref;

  const triggerProps: Record<string, unknown> = {
    "aria-describedby": open ? tooltipId : undefined,
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      (child.props.onPointerEnter as
        | ((event: React.PointerEvent<HTMLElement>) => void)
        | undefined)?.(event);
      showTooltip();
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      (child.props.onPointerLeave as
        | ((event: React.PointerEvent<HTMLElement>) => void)
        | undefined)?.(event);
      hideTooltip();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      (child.props.onFocus as
        | ((event: React.FocusEvent<HTMLElement>) => void)
        | undefined)?.(event);
      showTooltip();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      (child.props.onBlur as
        | ((event: React.FocusEvent<HTMLElement>) => void)
        | undefined)?.(event);
      hideTooltip();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      (child.props.onKeyDown as
        | ((event: React.KeyboardEvent<HTMLElement>) => void)
        | undefined)?.(event);

      if (event.key === "Escape") {
        setOpen(false);
      }
    },
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;

      if (typeof existingRef === "function") {
        existingRef(node);
      } else if (existingRef) {
        (existingRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
  };

  return (
    <>
      {React.cloneElement(child, triggerProps)}
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[9999] max-w-xs rounded-md bg-gray-950 px-3 py-2 text-xs font-medium leading-5 text-white shadow-lg",
              "animate-fadeIn",
              className
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {content}
            <span
              aria-hidden="true"
              className={cn(
                "absolute h-2 w-2 rotate-45 bg-gray-950",
                position.side === "top" && "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
                position.side === "bottom" && "left-1/2 bottom-full -translate-x-1/2 translate-y-1/2",
                position.side === "left" && "left-full top-1/2 -translate-y-1/2 -translate-x-1/2",
                position.side === "right" && "right-full top-1/2 -translate-y-1/2 translate-x-1/2"
              )}
            />
          </div>,
          document.body
        )}
    </>
  );
};

Tooltip.displayName = "Tooltip";

export { Tooltip };
export type { TooltipAlign, TooltipProps, TooltipSide };
