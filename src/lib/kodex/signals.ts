/**
 * src/lib/kodex/signals.ts — Normalized Signal Bus.
 * 
 * Single bus per document. Lazily updates values upon calling get().
 * Does NOT instantiate its own requestAnimationFrame to avoid competing with scene rAF loops.
 */

export interface SystemSignalState {
  pointerX: number;       // 0..1
  pointerY: number;       // 0..1
  velocity: number;       // pixels / second
  dwell: number;          // total dwell time in seconds
  focus: boolean;         // document focus state
  time: number;           // elapsed seconds since initialization
  returnCount: number;    // number of return visits
  memoryWeight: number;   // 0..1 normalized memory weight
  reducedMotion: boolean; // matchMedia prefers-reduced-motion
}

class SignalBus {
  private startTime: number;
  private lastTime: number;
  private lastX: number;
  private lastY: number;
  private rawX: number;
  private rawY: number;
  private currentVelocity: number;
  private hasPointerMoved: boolean;
  private isFocused: boolean;
  private returnCountVal: number;
  private memoryWeightVal: number;
  private isReducedMotion: boolean;
  private listenersAttached: boolean;

  private onMouseMoveHandler = (e: MouseEvent) => this.handlePointerMove(e.clientX, e.clientY);
  private onTouchMoveHandler = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  private onFocusHandler = () => { this.isFocused = true; };
  private onBlurHandler = () => { this.isFocused = false; };

  constructor() {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.startTime = now;
    this.lastTime = now;
    this.lastX = 0.5;
    this.lastY = 0.5;
    this.rawX = 0.5;
    this.rawY = 0.5;
    this.currentVelocity = 0;
    this.hasPointerMoved = false;
    this.isFocused = typeof document !== 'undefined' ? document.hasFocus() : true;
    this.returnCountVal = 0;
    this.memoryWeightVal = 0;
    this.isReducedMotion = false;
    this.listenersAttached = false;

    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  private initListeners(): void {
    if (this.listenersAttached) return;
    window.addEventListener('mousemove', this.onMouseMoveHandler, { passive: true });
    window.addEventListener('touchmove', this.onTouchMoveHandler, { passive: true });
    window.addEventListener('focus', this.onFocusHandler);
    window.addEventListener('blur', this.onBlurHandler);

    if (window.matchMedia) {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    this.listenersAttached = true;
  }

  private handlePointerMove(clientX: number, clientY: number): void {
    if (typeof window === 'undefined') return;
    const normX = Math.max(0, Math.min(1, clientX / window.innerWidth));
    const normY = Math.max(0, Math.min(1, clientY / window.innerHeight));
    this.rawX = normX;
    this.rawY = normY;
    this.hasPointerMoved = true;
  }

  public updatePointer(normX: number, normY: number): void {
    this.rawX = Math.max(0, Math.min(1, normX));
    this.rawY = Math.max(0, Math.min(1, normY));
    this.hasPointerMoved = true;
  }

  public setReturnCount(count: number): void {
    this.returnCountVal = Math.max(0, count);
  }

  public setMemoryWeight(weight: number): void {
    this.memoryWeightVal = Math.max(0, Math.min(1, weight));
  }

  /**
   * Lazily computes velocity, dwell, and time upon get() call.
   * Keeps zero background overhead when scenes are idle.
   */
  public get(): SystemSignalState {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dt = Math.max(0.001, (now - this.lastTime) / 1000);

    if (this.hasPointerMoved) {
      const dx = (this.rawX - this.lastX) * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const dy = (this.rawY - this.lastY) * (typeof window !== 'undefined' ? window.innerHeight : 1000);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const instVel = dist / dt;
      // Exponential smoothing for velocity
      this.currentVelocity = this.currentVelocity * 0.8 + instVel * 0.2;
      this.lastX = this.rawX;
      this.lastY = this.rawY;
      this.hasPointerMoved = false;
    } else {
      // Decay velocity when no movement occurs
      this.currentVelocity *= 0.9;
    }

    this.lastTime = now;
    const totalDwell = (now - this.startTime) / 1000;

    return {
      pointerX: this.lastX,
      pointerY: this.lastY,
      velocity: Number(this.currentVelocity.toFixed(2)),
      dwell: Number(totalDwell.toFixed(2)),
      focus: this.isFocused,
      time: Number(totalDwell.toFixed(3)),
      returnCount: this.returnCountVal,
      memoryWeight: this.memoryWeightVal,
      reducedMotion: this.isReducedMotion,
    };
  }

  public destroy(): void {
    if (typeof window !== 'undefined' && this.listenersAttached) {
      window.removeEventListener('mousemove', this.onMouseMoveHandler);
      window.removeEventListener('touchmove', this.onTouchMoveHandler);
      window.removeEventListener('focus', this.onFocusHandler);
      window.removeEventListener('blur', this.onBlurHandler);
      this.listenersAttached = false;
    }
  }
}

// Global Singleton for single bus per document
let globalBusInstance: SignalBus | null = null;

export function getSignalBus(): SignalBus {
  if (!globalBusInstance) {
    globalBusInstance = new SignalBus();
  }
  return globalBusInstance;
}
