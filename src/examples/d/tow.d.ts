declare class Two
{
    type: Two.Types;

    width: number;
    height: number;
    lastX: number;
    lastY: number;
    constructor(params?: TwoConstructionParams);
    appendTo(element: HTMLElement);

    makeLine(x1: number, y1: number, x2: number, y2: number): Two.Shape;
    makeRectangle(x: number, y: number, width: number, height: number): Two.Shape;
    makeCircle(x: number, y: number, radius: number): Two.Shape;
    makeEllipse(x: number, y: number, width: number, height: number): Two.Shape;

    makeCurve(x1: number, y1: number, open: boolean): Two.Shape;
    makeCurve(x1: number, y1: number, x2: number, y2: number, open: boolean): Two.Shape;
    makeCurve(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, open: boolean): Two.Shape;

    makePolygon(x1: number, y1: number, x2: number, y2: number, open: boolean): Two.Polygon;
    makeGroup(objects: Array<any>): Two.Group;

    bind(event: Two.Events, callback: (arg?: Array<any>) => void): Two;
    unbind(event: Two.Events, callback: (arg?: Array<any>) => void): Two;

    play();
    pause();
    update();
    render();
    add();
    remove();
    clear();

}
declare module Two
{
    enum Types
    {
        webgl,
        svg,
        canvas,
    }
    enum Events
    {
        play,
        pause,
        update,
        render,
        resize,
        change,
        remove,
        insert,
    }
    class Vector
    {
        x: number;
        y: number;
        set(x: number, y: number);
    }
    class LogicalShape
    {
        translation: Two.Vector;
        rotation: number;
        scale: number;

        visible: boolean;

        parent: Two.Group;
        vertices: Collection;
    }
    export class Shape extends LogicalShape
    {
        parent: Two.Group;

        stroke: string;
        fill: string;
        linewidth: number;
        opacity: number;

        cap: string;
        join: string;
        miter: number;

        noStroke();
        noFill();
        subdivide();
    }
    class Polygon extends Shape
    {
        vertices: Collection;
    }
    class Group extends LogicalShape
    {
        children: Array<any>
    }
    interface Collection extends Array<any> { }
}
interface TwoConstructionParams
{
    type?: Two.Types;
    width?: number;
    height?: number;
    autostart?: boolean;
    domElement?: HTMLCanvasElement;
    fullscreen?: boolean;
}
