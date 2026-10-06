// ===== 淘宝登录辅助 =====
// 拉起淘宝 → 同意隐私 → 立即登录 → 填手机号 → 发送验证码后停止(等人工输码)

var L = String.fromCharCode;

function log(msg) { toastLog(msg); console.log(msg); }

// 1. 拉起淘宝
shell("monkey -p com.taobao.taobao -c android.intent.category.LAUNCHER 1", true);
sleep(9000);
log("当前包: " + currentPackage());

// 2. 隐私弹窗(若出现)
var ag = text(L(0x540C, 0x610F)).findOnce(); // 同意
if (ag) { ag.click(); sleep(4000); log("已同意隐私"); }

// 3. 找"立即登录"(轮询最多 15 秒)
var b = null;
for (var i = 0; i < 6 && !b; i++) {
    b = text(L(0x7ACB, 0x5373, 0x767B, 0x5F55)).findOnce(); // 立即登录
    if (!b) b = desc(L(0x7ACB, 0x5373, 0x767B, 0x5F55)).findOnce();
    if (!b) sleep(2500);
}
if (!b) { log("未找到登录入口,请截图给我"); exit(); }
b.click();
sleep(6000);

// 4. 手机号输入框(第一个 EditText)
var e = className("android.widget.EditText").findOnce(0);
if (!e) {
    for (var i = 0; i < 4 && !e; i++) { e = className("android.widget.EditText").findOnce(0); if (!e) sleep(2500); }
}
if (!e) { log("未找到手机号输入框"); exit(); }
e.setText("14750472368");
sleep(1200);
log("手机号已填入");

// 5. 获取验证码
var g = text(L(0x83B7, 0x53D6, 0x9A8C, 0x8BC1, 0x7801)).findOnce();     // 获取验证码
if (!g) g = desc(L(0x83B7, 0x53D6, 0x9A8C, 0x8BC1, 0x7801)).findOnce();
if (g) { g.click(); log("验证码已发送,请查看短信并告诉我"); }
else { log("请手动点击获取验证码"); }
