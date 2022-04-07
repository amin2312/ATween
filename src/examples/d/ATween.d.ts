/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween - is a easy, fast and tiny tween library.
 */
 declare class ATween {
    /**
     * Specifies whether to stop all tweens.
     */
    static stop: boolean;
    /**
     * The manager for all tween instances.
     */
    private static _instances;
    /**
     * Indicates whether has installed in current environment.
     */
    private static _isInstalled;
    /**
     * Elapsed time of tween(unit: millisecond).
     **/
    elapsedMs: number;
    /**
     * Elapsed percent of tween(unit: millisecond).
     **/
    elapsedPercent: number;
    /**
     * Params of tween.
     */
    private _target;
    private _initedTarget;
    private _srcVals;
    private _dstVals;
    private _revVals;
    private _attachment;
    private _convertor;
    private _data;
    private _repeatNextStartMs;
    private _repeatRefs;
    private _repeatSteps;
    private _repeatDelayMs;
    private _updateSteps;
    private _startMs;
    private _delayMs;
    private _durationMs;
    private _repeatTimes;
    private _yoyo;
    private _isCompleted;
    private _pause;
    private _isRetained;
    private _easing;
    /**
     * The callback functions.
     **/
    private _onStartCallback;
    private _isStarted;
    private _onStartCallbackFired;
    private _onUpdateCallback;
    private _onCancelCallback;
    private _onCompleteCallback;
    private _onCompleteParams;
    private _onRepeatCallback;
    /**
     * Add a tween to global manager.
     */
    private static _add;
    /**
     * Delete a tween from global manager.
     */
    private static _del;
    /**
     * Updates all tweens by the specified time.
     * @param ms millisecond unit
     */
    static updateAll(ms: number): void;
    /**
     * Kill all tweens.
     * @remarks
     * WHEN the tween is retain, then it will be ignored.
     * @param withComplete Specifies whether to call complete function.
     */
    static killAll(withComplete?: boolean): void;
    /**
     * Kill all tweens of specified the target or attachment.
     * @param targetOrAttachment the target or attachment.
     * @param withComplete Specifies whether to call complete function.
     * @returns Number of killed instances
     */
    static killTweens(targetOrAttachment: any, withComplete?: boolean): number;
    /**
     * Check the target or attachment is tweening.
     * @param targetOrAttachment the target or attachment.
     */
    static isTweening(targetOrAttachment: any): boolean;
    /**
     * Constructor.
     */
    constructor(target: any | ATweenInterface);
    /**
     * Checks whether has installed frame trigger in current environment.
     */
    private static checkInstalled;
    /**
     * Create a tween.
     * @param target the targer object.
     * @param durationMs set duration, not including any repeats or delays.
     * @param delayMs set initial delay which is the length of time in ms before the tween should begin.
     * @returns Tween instance
     */
    static newTween(target: any, durationMs: number, delayMs?: number): ATween;
    /**
     * Create a once timer.
     * @remarks
     * It will auto start, you don't need to call 'start()' function.
     * @param intervalMs interval millisecond
     * @param onCompleteCallback The callback function when completion.
     * @param onCompleteParams The callback parameters when completion.
     * @returns Tween instance
     */
    static newOnce(intervalMs: number, onCompleteCallback: any, onCompleteParams?: Array<any>): ATween;
    /**
     * Create a timer.
     * @remarks
     * It will auto start, you don't need to call 'start()' function.
     * @param intervalMs interval millisecond
     * @param times Repeat Times(-1 is infinity)
     * @param onRepeatCallback  IF return false, then will cancel this timer.
     * @param onCompleteCallback The callback function when completion.
     * @param onCompleteParams The callback parameters when completion.
     * @returns Tween instance
     **/
    static newTimer(intervalMs: number, times: number, onRepeatCallback: (steps: number) => boolean, onCompleteCallback?: any, onCompleteParams?: Array<any>): ATween;
    /**
     * Start the tween/timer.
     * @returns Tween instance
     */
    start(): ATween;
    /**
     * Init target.
     */
    private initTarget;
    /**
     * Update target.
     **/
    private updateTarget;
    /**
     * Update tween by the specified time.
     * @param ms millisecond unit
     */
    update(ms: number): boolean;
    /**
     * Cancel.
     * @param withComplete Specifies whether to call complete function.
     * @returns Tween instance
     */
    cancel(withComplete?: boolean): void;
    /**
     * The destination value that the target wants to achieves.
     * @param endValus destination values.
     * @returns Tween instance
     */
    to(endValus: any): ATween;
    /**
     * Attach to HTMLElement element(The new tween value will auto sync to it).
     * @param obj HTMLElement or element id
     * @param convert the tween value convertor.
     * @returns Tween instance
     */
    attach(obj: HTMLElement | string, convert?: (curValue: number, startValue: number, endValue: number, percent: number, property: string) => any): ATween;
    /**
     * Store arbitrary data associated with this tween.
     */
    data(v: any): ATween;
    /**
     * Set repeat execution.
     * @param times the repeat time
     * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
     * @param delayMs delay trigger time
     * @returns Tween instance
     */
    repeat(times: number, yoyo?: boolean, delayMs?: number): ATween;
    /**
     * Immediate call the repeat function.
     * @remark
     * IF you need to init the environment, then it's a good choice.
     * @returns Tween instance
     */
    callRepeat(): ATween;
    /**
     * Set easing function.
     * @returns Tween instance
     */
    easing(func: (v: number) => number): ATween;
    /**
     * Keep this tween, killAll has no effect on it.
     * @returns Tween instance
     */
    retain(): ATween;
    /**
     * Release the retained tween.
     * @returns Tween instance
     */
    release(): ATween;
    /**
     * Indicates whether the tween is keeping.
     * @returns Tween instance
     */
    isRetain(): boolean;
    /**
     * Set pause state.
     */
    setPause(v: boolean): void;
    /**
     * Get pause state.
     */
    getPause(): boolean;
    /**
     * Get repeat times.
     */
    getRepeatTimes(): number;
    /**
     * Get target.
     */
    getTarget(): any;
    /**
     * Get attachment.
     */
    getAttachment(): any;
    /**
     * Get data.
     */
    getData(): any;
    /**
     * Set the callback function when startup.
     * @returns Tween instance
     */
    onStart(callback: () => void): ATween;
    /**
     * Set the callback function when updating.
     * @returns Tween instance
     */
    onUpdate(callback: (percent: number, times: number) => void): ATween;
    /**
     * Set the callback function when completion.
     * @returns Tween instance
     */
    onComplete(callback: (...argArray: any[]) => void, params?: Array<any>): ATween;
    /**
     * Set the callback function when canceled.
     * @returns Tween instance
     */
    onCancel(callback: () => void): ATween;
    /**
     * Set the callback function when repeating.
     * @returns Tween instance
     */
    onRepeat(callback: (steps: number) => boolean): ATween;
    /**
     * Simplified function for "to" - set alpha.
     */
    toAlpha(v: number): ATween;
    /**
     * Simplified function for "to" - set crood x.
     */
    toX(v: number): ATween;
    /**
     * Simplified function for "to" - set crood y.
     */
    toY(v: number): ATween;
    /**
     * Simplified function for "to" - set crood x and y.
     */
    toXY(a: number, b: number): ATween;
}
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * Tween Convertor.
 *
 * IF you don't need custom conversion feature,
 * YOU can compile the project without this file.
 */
declare class ATweenConvertor {
    /**
     * css unit function.
     */
    static css_unit(curValue: number, startValue: number, endValue: number, percent: number, property: string): any;
    /**
     * css gradient convert function
     */
    static css_gradient(curValue: number, startValue: number, endValue: number, percent: number, property: string): any;
}
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * Tween Easing.
 *
 * IF you don't need custom easing feature,
 * YOU can compile the project without this file.
 */
declare class ATweenEasing {
    /**
     * Linear
     */
    static Linear(k: number): number;
    /**
     * Quadratic
     */
    static QuadraticIn(k: number): number;
    static QuadraticOut(k: number): number;
    static QuadraticInOut(k: number): number;
    /**
     * Cubic
     */
    static CubicIn(k: number): number;
    static CubicOut(k: number): number;
    static CubicInOut(k: number): number;
    /**
     * Quartic.
     */
    static QuarticIn(k: number): number;
    static QuarticOut(k: number): number;
    static QuarticInOut(k: number): number;
    /**
     * Quintic.
     */
    static QuinticIn(k: number): number;
    static QuinticOut(k: number): number;
    static QuinticInOut(k: number): number;
    /**
     * Sinusoidal.
     */
    static SinusoidalIn(k: number): number;
    static SinusoidalOut(k: number): number;
    static SinusoidalInOut(k: number): number;
    /**
     * Exponential.
     */
    static ExponentialIn(k: number): number;
    static ExponentialOut(k: number): number;
    static ExponentialInOut(k: number): number;
    /**
     * Circular.
     */
    static CircularIn(k: number): number;
    static CircularOut(k: number): number;
    static CircularInOut(k: number): number;
    /**
     * Elastic.
     */
    static ElasticIn(k: number): number;
    static ElasticOut(k: number): number;
    static ElasticInOut(k: number): number;
    /**
     * Back.
     */
    static BackIn(k: number): number;
    static BackOut(k: number): number;
    static BackInOut(k: number): number;
    /**
     * Bounce.
     */
    static BounceIn(k: number): number;
    static BounceOut(k: number): number;
    static BounceInOut(k: number): number;
}
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween Property Interface.
 *
 * IF the target has implement this interface,
 * THEN the tween will use its functions first to update the target.
 */
interface ATweenInterface {
    /**
     * Get tween property when needs.
     **/
    get_tween_prop(name: String): any;
    /**
     * Set tween property when needs.
     **/
    set_tween_prop(name: String, value: any): void;
}
