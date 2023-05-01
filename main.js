//=========================================================================================
//MEMO
//=========================================================================================
//【画面表示の考え方】
//表示可能範囲 = ①フィールド(Field)の中に、（プロジェクターのスクリーンのような感じ）
//実際に表示するためのエリア = ②スクリーン(screen)を表示。（プロジェクターのスクリーンのような感じ）
//スクリーンには ③キャンバス(canvas)上に制作したものを投影する。

//①フィールドという壁面に、②スクリーンを掛け、そこに③キャンバス投影する。
//そのため、②スクリーンサイズは③キャンバスサイズと同じ比率で制作しておく必要がある。

//今回はキャンバスに描画しているため、そのままではスクリーンサイズをはみ出してしまう。
//キャンバス=スクリーンサイズの2倍
//ので、実際に表示するためのスクリーンサイズにトリミングする = ④仮想画面

//=========================================================================================
//
//=========================================================================================

//================================================
//デバッグのフラグ
//================================================

const DEBUG = true;

//================================================
//スムージング
//================================================

const SMOOTHING = false;

//================================================
//ゲームスピード(ms)
//================================================

const GAME_SPEED = 1000 / 60; //60fps(秒間60回/1000分の60)

//================================================
//スクリーンサイズ
//================================================

const SCREEN_W = 320; //横幅
const SCREEN_H = 320; //縦幅

//================================================
//キャンバスサイズ（描画範囲）
//================================================

const CANVAS_W = SCREEN_W * 2;
const CANVAS_H = SCREEN_H * 2;

//================================================
//フィールドサイズ（全体サイズ）
//================================================

const FIELD_W = SCREEN_W + 120;
const FIELD_H = SCREEN_H + 40;

//================================================
//星の数
//================================================

const STAR_MAX = 300;

//================================================
//キャンバス
//================================================

let can = document.getElementById("can");
//HTMLでの反映先 → id"can"

let con = can.getContext("2d");
//2D描画コンテキストを取得。3Dにしたら3D描画もできる。

can.width = CANVAS_W;
can.height = CANVAS_H;

con.mozimageSoomthingEnabled = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled = SMOOTHING;
con.imageSmoothingEnabled = SMOOTHING;
con.font = "30px 'Impact'";

//================================================
//仮想フィールド
//（仮想画面/実際に表示するための表示するための画面/トリミング）サイズ
//================================================

let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");
vcan.width = FIELD_W;
vcan.height = FIELD_H;
vcon.font = "15px 'Impact'";

//================================================
//カメラの座標
//================================================

let camera_x = 0;
let camera_y = 0;

//================================================
//ボスのHP
//================================================
let bossHP = 0;
let bossMHP = 0;

//================================================
//ゲームオーバー
//================================================
let gameOver = false;
let score = 0;

//================================================
//星の実態
//================================================

let star = [];

//================================================
//キーボードの状態
//================================================

let key = [];

//================================================
//オブジェクト達
//================================================

let teki = [];
let tekidan = [];
let tama = [];
let expl = [];
let jiki = new Jiki();
//teki[0] = new Teki(75, 200 << 8, 200 << 8, 0, 0);

//================================================
//ファイルを読み込み
let spriteImage = new Image();
spriteImage.src = "sprite.png";
//================================================
//
//
//
//=========================================================================================
//【自作関数】ゲーム初期化
//=========================================================================================

function gameInit() {
  for (let i = 0; i < STAR_MAX; i++) star[i] = new Star();
}

setInterval(gameLoop, GAME_SPEED);
//ゲームループを繰り返す（同じ処理を読みこんで、スクロールアニメーション繰り返す = 星空をずっと流す）

//----------------------------------
//【自作関数】オブジェクトをアップデート
//----------------------------------

function updateObj(obj) {
  for (let i = obj.length - 1; i >= 0; i--) {
    obj[i].update();
    if (obj[i].kill) obj.splice(i, 1);
  }
}

//-------------------------------
//【自作関数】オブジェクトを描画
//-------------------------------
function drawObj(obj) {
  for (let i = 0; i < obj.length; i++) obj[i].draw();
}

//================================================
//【自作関数】移動の処理
//================================================

function updateAll() {
  updateObj(star);
  updateObj(tama);
  updateObj(tekidan);
  updateObj(teki);
  updateObj(expl);
  if (!gameOver) jiki.update();
  //もしゲームオーバーフラグが立ったら自機の移動処理をストップ。
}

//================================================
//【function=自作関数】描画の処理
//================================================

function drawAll() {
  //-------------------------------
  //星空の描画
  //-------------------------------

  vcon.fillStyle = jiki.damage ? "red" : "black";
  vcon.fillRect(camera_x, camera_y, SCREEN_W, SCREEN_H);

  //-------------------------------
  //自機の描画
  //-------------------------------

  drawObj(star);
  drawObj(tama);
  if (!gameOver) jiki.draw();
  //もしゲームオーバーフラグが立ったら自機を消す。
  drawObj(teki);
  drawObj(expl);
  drawObj(tekidan);

  //-------------------------------
  //自機カメラ（自機に追従）
  //-------------------------------

  //自機の範囲0 ~ FIELD_W
  //カメラの範囲0 ~ (FIELD_W-SCREEN_W)

  camera_x = Math.floor((jiki.x >> 8) / FIELD_W * (FIELD_W - SCREEN_W));
  camera_y = Math.floor((jiki.y >> 8) / FIELD_H * (FIELD_H - SCREEN_H));

  //-------------------------------
  //ボスのHPを表示
  //-------------------------------

  if (bossHP > 0) {
    let sz = (SCREEN_W - 20) * bossHP / bossMHP;
    let sz2 = (SCREEN_W - 20)
    vcon.fillStyle = "rgba(255,0,0,0.5)";
    vcon.fillRect(camera_x + 10, camera_y + 10, sz, 10);
    vcon.strokeStyle = "rgba(255,0,0,0.9)";
    vcon.strokeRect(camera_x + 10, camera_y + 10, sz2, 10);

  }

  //-------------------------------
  //自機のHPを表示
  //-------------------------------

  if (jiki.hp > 0) {
    let sz = (SCREEN_W - 20) * jiki.hp / jiki.mhp;
    let sz2 = (SCREEN_W - 20)
    vcon.fillStyle = "rgba(0,0,255,0.5)";
    vcon.fillRect(camera_x + 10, camera_y + SCREEN_H-18, sz, 10);
    vcon.strokeStyle = "rgba(0,0,255,0.9)";
    vcon.strokeRect(camera_x + 10, camera_y + SCREEN_H-18, sz2, 10);

  }

  //-------------------------------
  //スコア表示
  //-------------------------------
  //vcon.fillStyle = "white";
  //vcon.fillText("SCORE"+score,camera_x+10,camera_y+40  )


  

  //-------------------------------
  //仮想画面から実際のキャンバスにコピー
  //-------------------------------

  con.drawImage(vcan, camera_x, camera_y, SCREEN_W, SCREEN_H, 0, 0, CANVAS_W, CANVAS_H);
  //0,0,は座標。スクリーンサイズの左上を指定している。
}

//================================================
//【function=自作関数】情報の表示
//================================================
function putInfo() {
  con.fillStyle = "white";

  //------------------------------------------
  //ゲームオーバーフラグが立ったときに以下を表示させる
  //------------------------------------------

  if (gameOver) {
    let s = "GAME OVER";
    let w = con.measureText(s).width;
    let x = CANVAS_W / 2 - w / 2; //CANVASの横位置の真 ん中半分から文字列の真ん中半分を引いた値
    let y = CANVAS_H / 2 - 30; //CANVASの縦位置から30px引いた値
    con.fillText(s, x, y);
    //con.fillText
    //conはlet.conのこと
    //.filltext=塗りつぶし文字を描画させる
    //con.fillText("表記内容" + 参照元.(length=要素数を取得)= 表記内容 + 参照元の値を表示, x座標, y座標);

    s = "Push'R'key to restart !";
    w = con.measureText(s).width;
    x = CANVAS_W / 2 - w / 2; //CANVASの横位置の真ん中半分から文字列の真ん中半分を引いた値
    y = CANVAS_H / 2 - 30 + 40; //CANVASの縦位置から20px引いた値
    con.fillText(s, x, y);
    //con.fillText
    //conはlet.conのこと
    //.filltext=塗りつぶし文字を描画させる
    //con.fillText("表記内容" + 参照元.(length=要素数を取得)= 表記内容 + 参照元の値を表示, x座標, y座標);
  }

  //-------------------------------
  //デバッグ情報==「弾を撃った数」の表示
  //-------------------------------
  if (DEBUG) {
    con.fillText("Tama:" + tama.length, 20, 40);
    con.fillText("Teki:" + teki.length, 20, 70);
    con.fillText("Tekidan:" + tekidan.length, 20, 100);
    con.fillText("Expl:" + expl.length, 20, 130);
    con.fillText("X:" + (jiki.x >> 8), 20, 160);
    con.fillText("Y:" + (jiki.y >> 8), 20, 190);
    con.fillText("HP:" + jiki.hp, 20, 220);
    con.fillText("SCORE:" + score, 20, 250);
    con.fillText("COUNT:" + gameCount, 20, 280);
    con.fillText("WAVE:" + gameWave, 20, 310);
    //con.fillText
    //.filltext=塗りつぶし文字を描画させる
    //con.fillText("表記内容" + 参照元.(length=要素数を取得)= 表記内容 + 参照元の値を表示, x座標, y座標);
  }
}


let gameCount =0;
let gameWave=0;
let gameRound=0;
let starSpeed=100;
let starSpeedReq=100;



//
//=========================================================================================
//ゲームループ
//=========================================================================================

function gameLoop() {
  gameCount++;
  if(starSpeedReq>starSpeed)starSpeed++;
  if(starSpeedReq<starSpeed)starSpeed--;
if(gameWave==0)
{
  if (rand(0, 20) == 1)
  //敵の出現量
  //ランダムに敵を出す。(0,XX) → XXの数値を増減させると敵の出現量が変化。数を減らすと敵が増える。
   {
    teki.push(new Teki(0, rand(0, FIELD_W) << 8, 0, 0, rand(300, 1200)));
  }
  if(gameCount>60*20)
  {
    gameWave++;
    gameCount=0;
    starSpeedReq=200;
  }

}
else if(gameWave==1)
{
  if (rand(0, 40) == 1)
  //敵の出現量
  //ランダムに敵を出す。(0,XX) → XXの数値を増減させると敵の出現量が変化。数を減らすと敵が増える。
   {
    teki.push(new Teki(1, rand(0, FIELD_W) << 8, 0, 0, rand(300, 1200)));
  }
  if(gameCount>60*20)
  {
    gameWave++;
    gameCount=0;
    starSpeedReq=100;
  }
}
  else if(gameWave==2)
  {
    if (rand(0, 30) == 1)
    //敵の出現量
    //ランダムに敵を出す。(0,XX) → XXの数値を増減させると敵の出現量が変化。数を減らすと敵が増える。
     {
      let r = (0,1);
      teki.push(new Teki(r, rand(0, FIELD_W) << 8, 0, 0, rand(300, 1200)));
    }
    if(gameCount>60*20)
    {
      gameWave++;
      gameCount=0;
      teki.push(new Teki(2, (FIELD_W / 2) << 8, -(70<<8), 0, 200));
      starSpeedReq=600;
    }
  }
  else if(gameWave==3)
  {
    if(teki.length==0)
    {
      gameWave=0;
      gameCount=0;
      gameRound++;
      starSpeedReq=100;
    }
  }
  updateAll();
  drawAll();
  putInfo();
}





//
//
//=========================================================================================
//オンロードでゲーム開始
//=========================================================================================
window.onload = function () {
  gameInit();
};

//=========================================================================================
//【関数とかのmemo】
//=========================================================================================

//【自作関数 / function name(){ここに処理内容を記述} 】
// 同じ処理を与える場合、何度も同じ文章を書くのではなく関数化することで、コードを簡略化する事ができる。
