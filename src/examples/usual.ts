/**
 * Test Units
 */
function a1(id: string)
{
    clearTween(id);

    var target = { x: 0 };
    tws[id] = ATween.newTween(target, 1000).to({ x: 410 })
        .onUpdate(function ()
        {
            document.getElementById(id).style.left = target.x + 'px';
        })
        .start();
}
function a2(id: string)
{
    clearTween(id);

    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 410 }).sync(id).start();
}
function a3(id: string)
{
    clearTween(id);

    tws[id] = ATween.newTween({ left: 0, top: 0 }, 1000).to({ left: 410, top: 30 }).sync(id).start();
}
function b1(id: string)
{
    clearTween(id);

    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 410 }).repeat(2, false).sync(id).start();
}
function b2(id: string)
{
    clearTween(id);

    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 410 }).repeat(2, false, 1000).sync(id).start();
}
function b3(id: string)
{
    clearTween(id);

    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 410 }).repeat(2, true).sync(id).start();
}
function c1_a(id: string)
{
    var tw = tws[id];
    if (tw)
    {
        tw.pause = false;
        return;
    }
    var target = { x: 0 };
    tws[id] = ATween.newTween(target, 5000).to({ x: 410 })
        .onUpdate(function () { document.getElementById(id).style.left = target.x + 'px'; })
        .onComplete(function () { clearTween(id); })
        .start();
}
function c1_b(id: string)
{
    var tw = tws[id];
    if (tw)
    {
        tw.pause = true;
    }
}
function d1_a(id: string)
{
    var id1 = id + 'a';
    var id2 = id + 'b';
    var id3 = id + 'c';
    ATween.newTween({ left: 0 }, 2000).to({ left: 410 }).repeat(2, true).sync(id1).start();
    ATween.newTween({ left: 0 }, 2000).to({ left: 410 }).repeat(2, true).sync(id2).start();
    ATween.newTween({ left: 0 }, 2000).to({ left: 410 }).repeat(2, true).sync(id3).retain().start();
}
function d1_b(id: string)
{
    ATween.killAll();
}
function e1(id: string)
{
    clearTween(id);
    var obj = document.getElementById(id);
    var o1 = document.getElementById(id + 's');
    var o2 = document.getElementById(id + 'u');
    var o3 = document.getElementById(id + 'c');
    o1.className = '';
    o2.className = '';
    o3.className = '';

    var target = { x: 0 };
    tws[id] = ATween.newTween(target, 1000, 100).to({ x: 410 })
        .onStart(function ()
        {
            o1.className = 'shine1';
        })
        .onUpdate(function (p: number, times: number)
        {
            if (times % 10 == 0) // update once in per 100 ms
            {
                o2.className = (o2.className == '' ? 'shine1' : '');
            }
            obj.style.left = target.x + 'px';
        })
        .onComplete(function (str: string)
        {
            console.log(str);
            o3.className = 'shine1';
        }, ['Event is completed'])
        .start();
}
/**
 * Utils.
 */
var tws: { [key: string]: ATween } = {};
function clearTween(id: string)
{
    console.log(id);
    var tid = tws[id];
    if (tid)
    {
        tid.cancel();
        delete tws[id];
    }
}