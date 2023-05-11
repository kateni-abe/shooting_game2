//=========================================================================================
//misk.js その他、共通関数
//=========================================================================================

//
//

//=========================================================================================
//キャラクターのベースクラス
//=========================================================================================

class CharaBase {
  constructor(snum, x, y, vx, vy) {
    this.sn = snum;
    //sn...スプライトナンバー（スプライトクラス内のリストを参照）
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.kill = false;
    this.count = 0;
  }

  update() {
    this.count++;
    this.x += this.vx;
    this.y += this.vy;

    if (
      this.x1 + (100 << 8) < 0 ||
      this.x - (100 << 8) > FIELD_W << 8 ||
      this.y + (100 << 8) < 0 ||
      this.y - (100 << 8) > FIELD_H << 8
    )
      this.kill = true;
  }

  draw() {
    drawSprite(this.sn, this.x, this.y);
  }
}

//
//=========================================================================================
//爆発のクラス
//=========================================================================================

class Expl extends CharaBase {
  constructor(c, x, y, vx, vy) {
    super(0, x, y, vx, vy);
    this.timer = c;
  }
  update() {
    if (this.timer) {
      this.timer--;
      return;
    }
    super.update();
  }

  draw() {
    if (this.timer) return;
    this.sn = 16 + (this.count >> 2);
    if (this.sn == 27) {
      this.kill = true;
      return;
    }
    super.draw();
  }
}

//
//=========================================================================================
//もっと派手な爆発のクラス
//=========================================================================================

function explosion(x, y, vx, vy) {
  expl.push(new Expl(0, x, y, vx, vy));
  for (let i = 0; i < 10; i++) {
    let evx = vx + (rand(-10, 10) << 6);
    let evy = vy + (rand(-10, 10) << 6);
    expl.push(new Expl(i, x, y, evx, evy));
    //20はスプライトの番号。それ以降は座標。
  }
}

//
//=========================================================================================
//星クラス
//=========================================================================================
class Star {
  constructor() {
    //初期値の設定。今回はclass StarのXY座標と星が動く"ベクトル"を指定しておく。
    this.x = rand(0, FIELD_W) << 8;
    //<<8 => keyword/bit演算子.不動小数点.2進数.256で1

    this.y = rand(0, FIELD_H) << 8;
    //<<8 => keyword/bit演算子.不動小数点.2進数.256で1

    this.vx = 0;
    //横には動かないので0

    this.vy = rand(100, 300);
    //(30,200)=min30~max200
    //今回は上から下に60fps（秒間60回）で流れるように動かす設定に。256で1なので、200だと1ピクセルも動かない。

    this.sz = rand(1, 2);
    //(1,2)=min1~max2
  }

  //================================================
  //星を描画する
  //================================================

  draw() {
    let x = this.x >> 8;
    let y = this.y >> 8;
    if (x < camera_x || x >= camera_x + SCREEN_W || y < camera_y || y >= camera_y + SCREEN_H) return;
    //カメラ外のときはリターンする
    //||はorの意味。

    vcon.fillStyle = rand(0, 2) != 0 ? "#66f" : "#aef";
    //rand(0,2)で0以外の場合、少し暗め（青/#66f）にする
    //乱数が1,2の場合は明るめ（水色/#8af）にする

    vcon.fillRect(this.x >> 8, this.y >> 8, this.sz, this.sz);
    //8bit左移動させているので、8bit右に戻して描画する。
  }

  //================================================
  //アップデートクラス（毎フレームごとの更新処理）
  //================================================

  update() {
    this.x += (this.vx * starSpeed) / 100;
    this.y += (this.vy * starSpeed) / 100;
    //毎フレームごとに乱数30から200動く

    if (this.y > FIELD_H << 8) {
      //もしフィールドの一番下まで到達した場合、上に戻す

      this.y = 0;
      this.x = rand(0, FIELD_W) << 8;
      //一番下まで到達して、上に戻って新しくスクロールが始まる場合、同じところからではなく、少し横にずらすことで背景のランダム感を演出。
    }
  }
}

//======================================================================
//ゲームオーバーにステータスになった時、Rを押してリロード
//======================================================================

document.addEventListener("keydown", (e) => {
  console.log(e.code); // コンソールに何の値が出力されているか確認(String型だと判明)
  key[e.code] = true;
  if (gameOver && key["KeyR"]) {
    delete jiki;
    jiki = new Jiki();
    gameOver = false;
    score = 0;
    delete teki;
  }
});

//================================================
//キーボードが離された時
//================================================

document.addEventListener("keyup", (e) => {
  key[e.code] = false;
});

//================================================
//【自作関数】スプライトを描画する
//================================================

function drawSprite(snum, x, y) {
  //snumは番号の取得
  let sx = sprite[snum].x;
  let sy = sprite[snum].y;
  let sw = sprite[snum].w;
  let sh = sprite[snum].h;

  let px = (x >> 8) - sw / 2;
  let py = (y >> 8) - sh / 2;
  //-sw/2,-sy/2は、スプライトの中心を座標に指定するための指示（船体が傾いたときと正対のときで横幅が違うので、中心を基点として表示位置を指定する必要がある）

  if (px + sw < camera_x || px >= camera_x + SCREEN_W || py + sh < camera_y || py >= camera_y + SCREEN_H) return;
  //カメラ外のときはリターンする

  vcon.drawImage(spriteImage, sx, sy, sw, sh, px, py, sw, sh);
}

//================================================
//整数の乱数をつくる
//================================================

function rand(min, max) {
  //minからmaxの乱数を取得。 Math.randomで0~0.99の乱数が取得される。
  //Math.floorで整数のみにする。（少数まで入れると変化量の設置に用いるための数字がめちゃくちゃ多くなってしまうため）
  //30~200の間の数を乱数（Math.random）に掛けることで、変化量をランダムに与える。
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//================================================
//当たり判定
//================================================

function checkHit(x1, y1, r1, x2, y2, r2) {
  //円同士の当たり判定
  let a = (x2 - x1) >> 8;
  let b = (y2 - y1) >> 8;
  let r = r1 + r2;

  return r * r >= a * a + b * b;

  //function checkHit(x1, y1, w1, h1, x2, y2, w2, h2)
  //矩形での当たり判定の場合は上記を使用（縦横の大きさの指定が必要。円での当たり判定の場合は半径"r"を用いる。）

  //矩形（四角形）同士の当たり判定

  /*let left1 = x1 >> 8;
  let right1 = left1 + w1;
  let top1 = y1 >> 8;
  let bottom1 = top1 + h1;
  let left2 = x2 >> 8;
  let right2 = left2 + w2;
  let top2 = y2 >> 8;
  let bottom2 = top2 + h2;

  return (left1 <= right2 && right1 >= left2 && top1 <= bottom2 && bottom1 >= top2);*/
}
