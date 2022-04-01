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
function a3_a(id: string)
{
    clearTween(id);

    tws[id] = ATween.newTween({ left: 0 }, 3000).to({ left: 410 }).sync(id)
        .onCancel(function (): void
        {
            console.log('cancel with complete');
        })
        .start();
}
function a3_b(id: string)
{
    var tw = tws[id];
    if (tw)
    {
        tw.cancel(true);
    }
}
function a4(id: string)
{
    clearTween(id);

    // css property grammar
    tws[id] = ATween.newTween({ 'background-color': 255 }, 1000).to({ 'background-color': 0 }).sync(id, ATweenConvertor.rgb).start();
}
function a5(id: string)
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
        tw.setPause(false);
        return;
    }
    tws[id] = ATween.newTween({ left: 0 }, 5000).to({ left: 410 }).sync(id)
        .onComplete(function () { clearTween(id); })
        .start();
}
function c1_b(id: string)
{
    var tw = tws[id];
    if (tw)
    {
        tw.setPause(true);
    }
}
function d1_a(id: string)
{
    var o1 = document.getElementById(id + 'a');
    var o2 = document.getElementById(id + 'b');
    var o3 = document.getElementById(id + 'c');
    ATween.killTweens(o1);
    ATween.killTweens(o2);
    ATween.killTweens(o3);
    ATween.newTween({ left: 0 }, 2000).to({ left: 410 }).repeat(2, true).sync(o1).start();
    ATween.newTween({ left: 0 }, 2000).to({ left: 410 }).repeat(2, true).sync(o2).start();
    ATween.newTween({ left: 0 }, 2000).to({ left: 410 }).repeat(2, true).sync(o3).retain().start();
}
function d1_b(id: string)
{
    var o1 = document.getElementById(id + 'a');
    ATween.killTweens(o1);
}
function d1_c(id: string)
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
            if (times % 10 == 0)
            {
                o2.className = (o2.className == '' ? 'shine1' : '');
            }
            obj.style.left = target.x + 'px';
        })
        .onComplete(function (str: string)
        {
            o3.className = str;
        }, ['shine3'])
        .start();
}
function f1(id: string)
{
    clearTween(id);

    var obj = document.getElementById(id);
    tws[id] = ATween.newTimer(1000, 10,
        function (steps: number): boolean
        {
            // Note: When call the 'callRepeat' function, the first value of 'steps' is 0
            if (steps == 0)
            {
                obj.innerText = 'The timer fires after 1000ms';
            }
            else
            {
                obj.innerText = 'The timer has been fired! times:' + steps;
            }
            console.log(window.performance.now());
            return true;
        }
        , function ()
        {
            obj.innerText = 'The timer is end';
        })
        .callRepeat() // you can call it to init
        .start();
}
function f2_a(id: string)
{
    clearTween(id);

    var obj = document.getElementById(id);
    obj.innerText = 'The timer fires after 1000ms';
    console.log(window.performance.now());
    tws[id] = ATween.newTimer(1000, -1,
        function (steps: number): boolean
        {
            obj.innerText = 'The timer has been fired! times:' + steps;
            console.log(window.performance.now());
            return true;
        }
        , function ()
        {
            obj.innerText = 'The timer is cancel(with complete)';
        })
        .start();
}
function f2_b(id: string)
{
    var tw = tws[id];
    if (tw)
    {
        tw.cancel(true);
    }
}
function f3(id: string)
{
    clearTween(id);

    var obj = document.getElementById(id);
    obj.innerText = 'The timer fires after 1000ms';
    console.log(window.performance.now());
    tws[id] = ATween.newOnce(1000,
        function (): void
        {
            obj.innerText = 'The timer has been fired!';
            console.log(window.performance.now());
        })
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