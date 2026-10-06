// ===== 淘宝闪购-幸运星 任务自动化 =====
// 前置: 已登录淘宝。流程: 进闪购 → 搜幸运星 → 循环做任务(签到/浏览/领取)

var L = String.fromCharCode;

function log(msg) { toastLog(msg); console.log(msg); }
function waitGone(t) { for (var i = 0; i < 6; i++) { if (!text(t).findOnce()) return; sleep(2000); } }

// ---- 工具: 常用词 ----
var W = {
    shangou: L(0x95EA, 0x8D2D),          // 闪购
    taobao: L(0x6DD8, 0x5B9D),           // 淘宝
    sousuo: L(0x641C, 0x7D22),           // 搜索
    xyz: L(0x5E78, 0x8FD0, 0x661F),      // 幸运星
    qidao: L(0x7B7E, 0x5230),            // 签到
    lingqu: L(0x9886, 0x53D6),           // 领取
    quwancheng: L(0x53BB, 0x5B8C, 0x6210), // 去完成
    quliulan: L(0x53BB, 0x6D4F, 0x89C8),   // 去浏览
    yiwancheng: L(0x5DF2, 0x5B8C, 0x6210), // 已完成
    guanbi: L(0x5173, 0x95ED),             // 关闭
    wangcheng: L(0x5B8C, 0x6210)           // 完成
};

// ---- 1. 确保淘宝前台 ----
if (currentPackage() != "com.taobao.taobao") {
    shell("monkey -p com.taobao.taobao -c android.intent.category.LAUNCHER 1", true);
    sleep(9000);
}
log("开始任务,当前: " + currentPackage());

// ---- 2. 进闪购(顶栏 tab) ----
var sg = text(W.shangou).findOnce();
if (sg) { sg.click(); sleep(6000); log("已进入闪购"); }
else {
    // 兜底: 滑到顶再找
    swipe(540, 800, 540, 1800, 400);
    sleep(1500);
    sg = text(W.shangou).findOnce();
    if (sg) { sg.click(); sleep(6000); log("已进入闪购(滑动后)"); }
    else { log("未找到闪购入口,请手动进入闪购页后 10 秒内完成"); sleep(10000); }
}

// ---- 3. 找幸运星入口 ----
var star = textContains(W.xyz).findOnce();
if (star) { star.click(); sleep(6000); log("已进入幸运星"); }
else {
    for (var i = 0; i < 3 && !star; i++) {
        swipe(540, 1900, 540, 800, 400); sleep(2000);
        star = textContains(W.xyz).findOnce();
        if (star) { star.click(); sleep(6000); log("已进入幸运星(滑动后)"); }
    }
    if (!star) log("未找到幸运星入口,将尝试在当前页做任务");
}

// ---- 4. 任务主循环 ----
var doneTasks = 0, doneClaims = 0, idle = 0;
for (var round = 1; round <= 50; round++) {
    log("第" + round + "轮");

    // 关闭弹窗
    var close = text(W.guanbi).findOnce();
    if (close) { close.click(); sleep(1500); }

    // 领取奖励
    var claim = text(W.lingqu).findOnce();
    if (claim) { claim.click(); doneClaims++; sleep(2500); log("领取 " + doneClaims); continue; }

    // 签到
    var sign = text(W.qidao).findOnce();
    if (sign && !sign.text().match(W.yiwancheng)) { sign.click(); sleep(3000); log("已签到"); continue; }

    // 去完成/去浏览
    var task = text(W.quwancheng).findOnce() || text(W.quliulan).findOnce();
    if (task) {
        task.click();
        doneTasks++;
        log("做任务 " + doneTasks);
        for (var t = 0; t < 5; t++) { sleep(3000); if (t == 1) swipe(540, 1600, 540, 1300, 300); }
        back(); sleep(3000);
        idle = 0;
        continue;
    }

    // 本屏无任务: 翻页
    idle++;
    if (idle >= 4) { log("任务完成! 浏览" + doneTasks + " 领取" + doneClaims); exit(); }
    swipe(540, 1900, 540, 900, 400);
    sleep(2500);
}
log("轮次上限,结束");
