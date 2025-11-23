import {
  type Accessor,
  createContext,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

// Tailwind’s default breakpoints
const breakpoints = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};
type Breakpoint = keyof typeof breakpoints;
const order: Breakpoint[] = ["base", "sm", "md", "lg", "xl", "2xl"];

function getBreakpoint(width: number) {
  if (width < breakpoints.sm) return "base";
  if (width < breakpoints.md) return "sm";
  if (width < breakpoints.lg) return "md";
  if (width < breakpoints.xl) return "lg";
  if (width < breakpoints["2xl"]) return "xl";
  return "2xl";
}

export function createBreakpoint() {
  const [breakpoint, setBreakpoint] = createSignal<Breakpoint>("base");

  const update = () => {
    const value = breakpoint();
    const newValue = getBreakpoint(window.innerWidth);
    if (value !== newValue) {
      setBreakpoint(newValue);
    }
  };

  onMount(() => {
    setBreakpoint(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", update);
    onCleanup(() => {
      window.removeEventListener("resize", update);
    });
  });

  const isAtLeast = (bp: Breakpoint) =>
    order.indexOf(breakpoint()) >= order.indexOf(bp);

  return { breakpoint, isAtLeast };
}

const BreakpointContext = createContext<{
  breakpoint: Accessor<Breakpoint>;
  isAtLeast: (bp: Breakpoint) => boolean;
}>();

export function BreakpointContextProvider(props: { children: JSX.Element }) {
  const { breakpoint, isAtLeast } = createBreakpoint();
  return (
    <BreakpointContext.Provider
      value={{
        breakpoint,
        isAtLeast,
      }}
    >
      {props.children}
    </BreakpointContext.Provider>
  );
}

export function useBreakpoint() {
  const breakpointSignal = useContext(BreakpointContext);
  if (!breakpointSignal) throw new Error("Missing BreakpointContext");
  return breakpointSignal;
}
