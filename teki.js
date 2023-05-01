//=========================================================================================
//teki.js 敵関連
//=========================================================================================

//
//
//=========================================================================================
//敵弾クラス
//=========================================================================================
class Tekidan extends CharaBase {
  constructor(sn, x, y, vx, vy, t) {
    super(sn, x, y, vx, vy);
    this.r = 3;
    this.timer = t;
    if (t == undefined) this.timer = 0;
    else this.timer = t;
  }

  //-------------------------------------
  //敵弾が当たったときの判定（どう変化させるか）
  //------------------------------------
  update() {
    if (this.timer) {
      this.timer--;
      return;
    }
    super.update();

    if (!gameOver && !jiki.muteki && checkHit(this.x, this.y, this.r, jiki.x, jiki.y, jiki.r)) {
      this.kill = true;
      //敵の弾のダメージは30。もし0以下になったらゲームオーバー。
      if ((jiki.hp -= 30) <= 0) {
        gameOver = true;
      } else {
        jiki.damage = 10;
        jiki.muteki = 60;
      }
    }
    this.sn = 14 + ((this.count >> 3) & 1);
  }
}

//
//
//=========================================================================================
//敵クラス
//=========================================================================================

//extendsを使うと、親クラス（今回はCharaBase）の情報を元にした子クラスを生成することができる
class Teki extends CharaBase {
  constructor(t, x, y, vx, vy) {
    super(0, x, y, vx, vy);
    //tnum 敵number
    this.tnum = tekiMaster[t].tnum;
    this.r = tekiMaster[t].r;
    this.mhp = tekiMaster[t].hp;
    this.hp = this.mhp;
    this.score = tekiMaster[t].score;
    this.flag = false;
    this.dr = 90; //弾の発射方向
    this.relo=0;
    //敵番号を受けたら、tekiMasterから値を持ってくる
  }

  update() {
    //----------------------------
    //共通のアップデート処理
    //----------------------------
    if(this.relo)this.relo--;
    super.update(); //親要素のfunction"update"の呼び出し
    

    //----------------------------
    //個別のアップデート処理
    //----------------------------
    tekiFunk[this.tnum](this);
    //敵パターンの配列を呼び出して、()をつけて関数処理をするように記述。

    //------------------------------------
    //敵に直撃したときのの判定（どう変化させるか）
    //------------------------------------
    if (!gameOver && !jiki.muteki && checkHit(this.x, this.y, this.r, jiki.x, jiki.y, jiki.r)) {
      this.kill = true;
      //敵の弾のダメージは30。もし0以下になったらゲームオーバー。
      if ((jiki.hp -= 30) <= 0) {
        gameOver = true;
      } else {
        jiki.damage = 10;
        jiki.muteki = 60;
      }
    }
  }
}

//================================================
//敵の動き
//================================================

//----------------------------------------------------
//【function=自作関数】弾の発射パターン（自機に向けて弾を発射）
//----------------------------------------------------

function tekiShot(obj, speed) {
  //function 名称(){ここに指示を記述}

  if (gameOver) return;
  //もしゲームオーバーフラグが立っていたら引き返す(処理に進まない) = 砲撃をしない

  let px = (obj.x >> 8) ;
  let py = (obj.y >> 8) ;
  //-sw/2,-sy/2は、スプライトの中心を座標に指定するための指示（船体が傾いたときと正対のときで横幅が違うので、中心を基点として表示位置を指定する必要がある）

  if (px-40 < camera_x || px+40 >= camera_x + SCREEN_W || py-40< camera_y || py+40 >= camera_y + SCREEN_H) return;





  let an, dx, dy;
  an = Math.atan2(jiki.y - obj.y, jiki.x - obj.x);
  //an = angle = 角度
  //自機と敵の角度を求める（敵が自分に弾を撃つための角度）
  //角度を求めるときはアークタンジェントを使う。タンジェントにはatanとatan2があり記述方法が異なる。
  //角度θ=atan(高さ（大きいX座標 - 小さいX座標）/底辺（大きいY座標 - 小さいY座標）)
  //角度θ=atan2(底辺（大きいY座標 - 小さいY座標）,高さ（大きいX座標 - 小さいX座標）)

  dx = Math.cos(an) * speed;
  dy = Math.sin(an) * speed;

  tekidan.push(new Tekidan(15, obj.x, obj.y, dx, dy));
}

//-------------------------------------------
//【function=自作関数】ピンクのひよこの移動パターン
//-------------------------------------------

function tekiMove01(obj) {
  //function 名称(){ここに指示を記述}
  if (!obj.flag) {
    if (jiki.X > obj.x && obj.vx < 120) obj.vx += 4;
    else if (jiki.x < obj.x && obj.vx > -120) obj.vx -= 4;
  } else {
    if (jiki.X < obj.x && obj.vx < 400) obj.vx += 30;
    else if (jiki.x > obj.x && obj.vx > -400) obj.vx -= 30;
  }

  if (Math.abs(jiki.y - obj.y) < 100 << 8 && !obj.flag) {
    obj.flag = true;
    tekiShot(obj, 600); //600speedに代入したスピードを指定した値
  }
  //自機に接近したときにUターンして逃げる指示
  if (obj.flag && obj.vy > -800) obj.vy -= 30;

  //------------------------------------
  //【const=変数・定数】スプライト（ひよこ）の変更
  //------------------------------------

  const ptn = [39, 40, 39, 41];
  obj.sn = ptn[(obj.count >> 3) & 3]; //&3はbit演算子
}

//-------------------------------------------
//【function=自作関数】黄色のひよこの移動パターン
//-------------------------------------------

function tekiMove02(obj) {
  //function 名称(){ここに指示を記述}
  if (!obj.flag) {
    if (jiki.X > obj.x && obj.vx < 600) obj.vx += 30;
    else if (jiki.x < obj.x && obj.vx > -600) obj.vx -= 30;
  } else {
    if (jiki.X < obj.x && obj.vx < 600) obj.vx += 30;
    else if (jiki.x > obj.x && obj.vx > -600) obj.vx -= 30;
  }

  if (Math.abs(jiki.y - obj.y) < 100 << 8 && !obj.flag) {
    obj.flag = true;
    tekiShot(obj, 600);
  }
  //-----------------------------------
  //【const=変数】スプライト（ひよこ）の変更
  //-----------------------------------
  const ptn = [33, 34, 33, 35];
  obj.sn = ptn[(obj.count >> 3) & 3]; //&3はbit演算子
}

//-----------------------------------------------
//【function=自作関数】ボスひよこ（黄色）の移動パターン
//-----------------------------------------------

function tekiMove03(obj) {
  if (!obj.flag && obj.y >> 8 >= 50) obj.flag = 1;
  if (obj.flag == 1) {
    if ((obj.vy -= 2) < 0) {
      obj.flag = 2;
      obj.vy = 0;
    }
  } else if (obj.flag == 2) {
    if (obj.vx < 300) obj.vx += 10;
    if (obj.x >> 8 > FIELD_W - 100) obj.flag = 3;
  } else if (obj.flag == 3) {
    if (obj.vx > -300) obj.vx -= 10;
    if (obj.x >> 8 < 100) obj.flag = 2;
  }
  //function 名称(){ここに指示を記述}

  //-----------------------------------
  //弾の発射
  //-----------------------------------

  if (obj.flag > 1) {
    let an, dx, dy;
    an = (obj.dr * Math.PI) / 180;
    //an = angle = 角度
    //自機と敵の角度を求める（敵が自分に弾を撃つための角度）
    //角度を求めるときはアークタンジェントを使う。タンジェントにはatanとatan2があり記述方法が異なる。
    //角度θ=atan(高さ（大きいX座標 - 小さいX座標）/底辺（大きいY座標 - 小さいY座標）)
    //角度θ=atan2(底辺（大きいY座標 - 小さいY座標）,高さ（大きいX座標 - 小さいX座標）)

    dx = Math.cos(an) * 300;
    dy = Math.sin(an) * 300;
    let x2 = (Math.cos(an) * 75) << 8;
    let y2 = (Math.sin(an) * 75) << 8;

    tekidan.push(new Tekidan(15, obj.x + x2, obj.y + y2, dx, dy, 60));

    if ((obj.dr += 12) >= 360) obj.dr = 0;
  }

  //-----------------------------------
  //追加攻撃
  //-----------------------------------
  if(obj.hp < obj.mhp / 2)
   {
    let c = obj.count % (60 * 5);
    if (c / 10 < 4 && c % 10 == 0)
    {
      let an, dx, dy;
      an = (90 + 45-(c / 10) * 30) * Math.PI / 180;
      //an = angle = 角度
      //自機と敵の角度を求める（敵が自分に弾を撃つための角度）
      //角度を求めるときはアークタンジェントを使う。タンジェントにはatanとatan2があり記述方法が異なる。
      //角度θ=atan(高さ（大きいX座標 - 小さいX座標）/底辺（大きいY座   標 - 小さいY座標）)
      //角度θ=atan2(底辺（大きいY座標 - 小さいY座標）,高さ（大きいX座標 - 小さいX座標）)

      dx = Math.cos(an) * 300;
      dy = Math.sin(an) * 300;
      let x2 = (Math.cos(an) * 75) << 8;
      let y2 = (Math.sin(an) * 75) << 8;
      teki.push(new Teki(3, obj.x + x2, obj.y + y2, dx, dy));
    }
  }

  //-----------------------------------
  //【const=変数】スプライト（ひよこ）の変更
  //-----------------------------------
  obj.sn = 75;
}

//-----------------------------------------------------------
//【function=自作関数】ボスひよこの子供（黄色のひよこ）の移動パターン
//----------------------------------------------------------

function tekiMove04(obj) {
  //function 名称(){ここに指示を記述}
  if(obj.count==10){
    obj.vx=obj.vy=0;
  }

  if(obj.count==60){
   if(obj.x>jiki.x)obj.vx=-30;
   else obj.vx=30;
   obj.vy=100;
  }

  if(obj.count>100 &&!obj.relo){ 
    if(rand(0,100)==1){
      tekiShot(obj,300);
      obj.relo=200;
    }
  }

  //-----------------------------------
  //【const=変数】スプライト（ひよこ）の変更
  //-----------------------------------
  const ptn = [33, 34, 33, 35];
  obj.sn = ptn[(obj.count >> 3) & 3]; //&3はbit演算子
}

//----------------------------
//敵のパターンを呼び出すための配列
//----------------------------

let tekiFunk = [tekiMove01, tekiMove02, tekiMove03,tekiMove04,];
