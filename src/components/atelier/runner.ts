export type RunnerMode = "arriving" | "running" | "falling";
export interface RunnerState {
  mode: RunnerMode;
  progress: number;
  fall: number;
  arrival: number;
}
export const newRunner = (): RunnerState => ({
  mode: "arriving",
  progress: 0,
  fall: 0,
  arrival: 0,
});
export const RUN_SPEED = 1.85;
export const DROP_TIME = 0.75;
export const FALL_TIME = 1.5;
export const isAirborne = (progress: number) =>
  progress % 1 > 0.3 && progress % 1 < 0.88;

/**
 * Time is capped by the caller; a suspended tab cannot advance the story.
 * `unsupported` means the stone under the runner, or the one he is jumping to, has
 * been knocked loose. He falls, and once he is out of sight he drops from above onto
 * `respawn`, a whole tread the caller has checked is still in place.
 */
export function advanceRunner(
  state: RunnerState,
  dt: number,
  unsupported: boolean,
  paused: boolean,
  respawn = Math.ceil(state.progress),
): RunnerState {
  if (paused) return state;
  if (state.mode === "falling") {
    const fall = state.fall + dt;
    return fall > FALL_TIME
      ? { mode: "arriving", progress: respawn, fall: 0, arrival: 0 }
      : { ...state, fall };
  }
  if (state.mode === "arriving") {
    // A stone pulled away mid-drop is missed, not landed on.
    if (unsupported && state.arrival > 0.55) return { ...state, mode: "falling", fall: 0 };
    const arrival = Math.min(1, state.arrival + dt / DROP_TIME);
    return { ...state, arrival, mode: arrival === 1 ? "running" : "arriving" };
  }
  if (unsupported) return { ...state, mode: "falling", fall: 0 };
  return { ...state, mode: "running", progress: state.progress + dt * RUN_SPEED };
}
