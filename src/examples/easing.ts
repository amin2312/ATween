/// <reference path="../ts/ATween.ts" />
/// <reference path="./d/tow.d.ts" />

var GAP = 50;
function Main()
{
    var root = document.getElementById('easing');
    for (var i = 0; i < root.children.length; i++)
    {
        var item = root.children[i] as HTMLDivElement;
        if (item.className != 'item')
        {
            continue;
        }
        var eName = (item.children[0] as HTMLDivElement);
        var eCanvas = (item.children[1] as HTMLCanvasElement);
        // init canvas
        eCanvas.setAttribute('width', item.clientWidth + '');
        eCanvas.setAttribute('height', (item.clientHeight - eName.clientHeight) + '');
        var two = new Two({ width: eCanvas.width, height: eCanvas.height, domElement: eCanvas, autostart: true });
        // draw edges
        var shpae:Two.Shape;
        shpae = two.makeLine(0, GAP, two.width, GAP);
        shpae.stroke = 'rgb(210, 210, 210)';
        shpae.linewidth = 1;
        shpae = two.makeLine(0, two.height - GAP, two.width, two.height - GAP);
        shpae.stroke = 'rgb(210, 210, 210)';
        shpae.linewidth = 1;
        // start work
        var easingName = eName.innerText;
        var func = (ATweenEasing as any)[easingName];
        ATween.newTween({ v: 0 }, 2000).to({ v: 100 }).easing(func).onUpdate(onEasingUpdate).data(two).onComplete(onEasingComplete).start();
    }
}
function onEasingUpdate(this: ATween, p: number, times: number)
{
    var t = this.getTarget();
    var two: Two = this.getData();

    var nextX = Math.floor(p * two.width);
    var nextY = GAP + two.height - GAP * 2 - t.v;
    var lastX = two.lastX || nextX;
    var lastY = two.lastY || nextY;

    var shpae = two.makeLine(lastX, lastY, nextX, nextY);
    shpae.stroke = 'rgb(250, 0, 0)';
    shpae.linewidth = 1;

    two.lastX = nextX;
    two.lastY = nextY;
}
function onEasingComplete(this: ATween)
{
    var two: Two = this.getData();
    two.pause();
}
Main();