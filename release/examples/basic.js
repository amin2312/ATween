"use strict";
/// <reference path="d/ATween.d.ts" />
/**
 * Test Units
 */
function a1(id) {
    clearTween(id);
    var target = { x: 0 };
    tws[id] = ATween.newTween(target, 1000).to({ x: 504 })
        .onUpdate(function (percent, steps) {
        document.getElementById(id).style.left = target.x + 'px';
    })
        .start();
}
function a6(id) {
    clearTween(id);
    // Implement ITweenProp interface
    var target = {
        element: document.getElementById(id),
        get_tween_prop: function (name) {
            return 0;
        },
        set_tween_prop: function (name, value) {
            this.element.style.setProperty(name, value + 'px');
        }
    };
    tws[id] = ATween.newTween(target, 1000).to({ left: 504 }).start();
}
function a2(id) {
    clearTween(id);
    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 504 }).attach(id).start();
}
function a3_a(id) {
    clearTween(id);
    tws[id] = ATween.newTween({ left: 0 }, 3000).to({ left: 504 }).attach(id)
        .onCancel(function () {
        console.log('cancel with complete');
    })
        .start();
}
function a3_b(id) {
    var tw = tws[id];
    if (tw) {
        tw.cancel(true);
    }
}
function a4(id) {
    clearTween(id);
    // css property grammar
    tws[id] = ATween.newTween({ 'background-color': 255 }, 1000).to({ 'background-color': 0xFF0000 }).attach(id, ATweenConvertor.css_gradient).start();
}
function a5(id) {
    clearTween(id);
    tws[id] = ATween.newTween({ left: 0, top: 0 }, 1000).to({ left: 504, top: 40 }).attach(id).start();
}
function b1(id) {
    clearTween(id);
    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 504 }).repeat(2, false).attach(id).start();
}
function b2(id) {
    clearTween(id);
    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 504 }).repeat(2, false, 1000).attach(id).start();
}
function b3(id) {
    clearTween(id);
    tws[id] = ATween.newTween({ left: 0 }, 1000).to({ left: 504 }).repeat(2, true).attach(id).start();
}
function c1_a(id) {
    var tw = tws[id];
    if (tw) {
        tw.setPause(false);
        return;
    }
    tws[id] = ATween.newTween({ left: 0 }, 5000).to({ left: 504 }).attach(id)
        .onComplete(function () { clearTween(id); })
        .start();
}
function c1_b(id) {
    var tw = tws[id];
    if (tw) {
        tw.setPause(true);
    }
}
function d1_a(id) {
    var o1 = document.getElementById(id + 'a');
    var o2 = document.getElementById(id + 'b');
    var o3 = document.getElementById(id + 'c');
    ATween.killTweens(o1);
    ATween.killTweens(o2);
    ATween.killTweens(o3);
    ATween.newTween({ left: 0 }, 2000).to({ left: 504 }).repeat(2, true).attach(o1).start();
    ATween.newTween({ left: 0 }, 2000).to({ left: 504 }).repeat(2, true).attach(o2).start();
    ATween.newTween({ left: 0 }, 2000).to({ left: 504 }).repeat(2, true).attach(o3).retain().start();
}
function d1_b(id) {
    var o1 = document.getElementById(id + 'a');
    ATween.killTweens(o1);
}
function d1_c(id) {
    ATween.killAll();
}
function e1(id) {
    clearTween(id);
    var obj = document.getElementById(id);
    var o1 = document.getElementById(id + 's');
    var o2 = document.getElementById(id + 'u');
    var o3 = document.getElementById(id + 'c');
    o1.className = '';
    o2.className = '';
    o3.className = '';
    var target = { x: 0 };
    tws[id] = ATween.newTween(target, 1000, 100).to({ x: 504 })
        .onStart(function () {
        o1.className = 'shine1';
    })
        .onUpdate(function (p, times) {
        if (times % 10 == 0) {
            o2.className = (o2.className == '' ? 'shine1' : '');
        }
        obj.style.left = target.x + 'px';
    })
        .onComplete(function (str) {
        o3.className = str;
    }, ['shine3'])
        .start();
}
function f1(id) {
    clearTween(id);
    var obj = document.getElementById(id);
    tws[id] = ATween.newTimer(1000, 3, function (steps) {
        // Note: When call the 'callRepeat' function, the first value of 'steps' is 0
        if (steps == 0) {
            obj.innerText = 'The timer fires after 1000ms';
        }
        else {
            obj.innerText = 'The timer has been fired! times:' + steps;
        }
        console.log(window.performance.now());
        return true;
    }, function () {
        obj.innerText = 'The timer is end';
    })
        .callRepeat(); // you can call it to init
}
function f2_a(id) {
    clearTween(id);
    var obj = document.getElementById(id);
    obj.innerText = 'The timer fires after 1000ms';
    console.log(window.performance.now());
    tws[id] = ATween.newTimer(1000, -1, function (steps) {
        obj.innerText = 'The timer has been fired! times:' + steps;
        console.log(window.performance.now());
        return true;
    }, function () {
        obj.innerText = 'The timer is cancel(with complete)';
    });
}
function f2_b(id) {
    var tw = tws[id];
    if (tw) {
        tw.cancel(true);
    }
}
function f3(id) {
    clearTween(id);
    var obj = document.getElementById(id);
    obj.innerText = 'The timer fires after 1000ms';
    console.log(window.performance.now());
    tws[id] = ATween.newOnce(1000, function () {
        obj.innerText = 'The timer has been fired!';
        console.log(window.performance.now());
    });
}
/**
 * Utils.
 */
var tws = {};
function clearTween(id) {
    console.log(id);
    var tid = tws[id];
    if (tid) {
        tid.cancel();
        delete tws[id];
    }
}
