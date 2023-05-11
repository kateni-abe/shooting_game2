//=========================================================================================
//jiki.js 自機関連
//=========================================================================================

//
//
//=========================================================================================
//弾クラス
//=========================================================================================
class Tama extends CharaBase {
  constructor(x, y, vx, vy) {
    super(5, x, y, vx, vy);
    //5はスプライト番号
    //this.w = 4; //弾の大きさ(横幅)...矩形判定の際に使う
    //this.h = 6; //弾の大きさ(高さ)...矩形判定の際に使う
    this.r = 4;
  }

  update() {
    super.update();

    for (let i = 0; i < teki.length; i++) {
      if (!teki[i].kill) {
        if (checkHit(this.x, this.y, this.r, teki[i].x, teki[i].y, teki[i].r)) {
          this.kill = true;

          if ((teki[i].hp -= 10) <= 0) {
            //自機の弾の強さ=10。もし敵のHPが0以下になったら敵を消し、スコアを敵のスコア分加算する
            teki[i].kill = true;
            explosion(teki[i].x, teki[i].y, teki[i].vx >> 3, teki[i].vy >> 3);
            score += teki[i].score;
          } else {
            expl.push(new Expl(0, this.x, this.y, 0, 0));
            //もし敵が死ななかった場合は爆発のみ起きる
          }
          if (teki[i].mhp >= 1000) {
            bossHP = teki[i].hp;
            bossMHP = teki[i].mhp;
          }

          break;
        }
      }
    }
  }

  draw() {
    super.draw();
  }
}

//
//
//
//=========================================================================================
//自機クラス
//=========================================================================================
class Jiki {
  constructor() {
    this.x = (FIELD_W / 2) << 8; //自機のスタート位置
    this.y = (FIELD_H - 50) << 8;
    (FIELD_H / 2) << 8; //自機のスタート位置
    this.mhp = 100; //hpの最大値の設定(maxhp)。今回は100。
    this.hp = this.mhp;
    this.speed = 512; //256で1フレームに1ピクセルで動く
    this.anime = 0;
    this.reload = 0;
    this.relo2 = 2;
    this.r = 3;
    this.damage = 0;
    this.muteki = 60;
    this.count = 0;
  }

  //----------------------------
  //自機の移動
  //----------------------------

  update() {
    this.count++;
    if (this.damage) this.damage--;
    if (this.muteki) this.muteki--;

    //----------------------------
    //発射ボタン スペースキー
    //----------------------------

    if (key["Space"] && this.reload == 0) {
      //----------------------------
      //弾の設定（4砲搭載）
      //----------------------------
      tama.push(new Tama(this.x + (3 << 8), this.y - (10 << 8), 0, -2000));
      tama.push(new Tama(this.x - (3 << 8), this.y - (10 << 8), 0, -2000));
      tama.push(new Tama(this.x + (8 << 8), this.y - (20 << 8), 200, -2000));
      tama.push(new Tama(this.x - (8 << 8), this.y - (20 << 8), -200, -2000));
      //tama.push(new Tama(弾の位置X軸,弾の位置Y軸, 弾の角度,弾のスピード));

      this.reload = 4;
      if (++this.relo2 == 4) {
        this.reload = 20;
        this.relo2 = 0;
      }
    }
    if (!key["Space"]) this.reload = this.relo2 = 0;

    if (this.reload > 0) this.reload--;

    //----------------------------
    //左ボタン
    //----------------------------

    if (key["ArrowLeft"] && this.x > this.speed) {
      this.x -= this.speed;
      if (this.anime > -8) this.anime--;
    }

    //----------------------------
    /*右ボタン*/
    //----------------------------
    else if (key["ArrowRight"] && this.x <= (FIELD_W << 8) - this.speed) {
      this.x += this.speed;
      if (this.anime < 8) this.anime++;
    }

    //----------------------------
    //右、左を押していない時、0（正面）の画像に戻る
    //----------------------------
    else {
      if (this.anime > 0) this.anime--;
      if (this.anime < 0) this.anime++;
    }

    //----------------------------
    //上ボタン
    //----------------------------

    if (key["ArrowUp"] && this.y > this.speed) this.y -= this.speed;

    //----------------------------
    //下ボタン
    //----------------------------

    if (key["ArrowDown"] && this.y <= (FIELD_H << 8) - this.speed) this.y += this.speed;
  }

  //----------------------------
  //描画
  //----------------------------

  draw() {
    if (this.muteki && this.count & 1) return;
    drawSprite(2 + (this.anime >> 2), this.x, this.y);
    //（何番目の画像内か指定, X座標,Y座標）

    ///ジェット噴射（今回は使用しない）
    //if (this.muteki && this.count & 1) return;
    //drawSprite(9 + (this.anime >> 2), this.x, this.y + (24 << 8));
  }
}
