# nodeの使い方

## 基本操作
右クリック：新しいノードの追加  
スクロール：拡大縮小  
中央ボタンでドラッグ：移動  

DELETEキー：選択中のノードを削除  
vキー：選択中のノードを複製

複数選択 ← ドラッグもしくはSHIFTを押しながらノードを選択  
ワイヤーを結ぶ ← ノードのソケットからソケットへとドラッグ  
ワイヤーを切断 ← 入力側のソケットをクリック  
(入力側のソケットには１本までしかワイヤーを結べません。２本目を結ぼうとすると１本目が切断されます)  

## 入力ボックス
入力ソケットが空のときは数値などを入れる入力ボックスがあります。  
クリックで開きクリックもしくはENTERで確定します。  
入力ボックスに何も入っていない、識別できない文字列が入っている状態では値は0となります。  
入力ボックスには数値以外に以下のコマンドがあります。
* mouseX
* mouseY
* frame
* width 
* height
* pi

## ヘッダーのボタン
三角(四角)：実行、停止  
目玉：ノードの表示、非表示  
↓：セーブ  
↑：ロード

## ノード
#### 基本演算
省略
#### 演算A
省略
#### 演算B
processingとかでよく見るあれ
#### 論理演算
条件を満たすと1それ以外では0を出力する  
入力値は0のみをfalse、それ以外はtrueとする
#### 入力
* slider
* box
* array：0~n-1の数列を生成  
入力Aが(0,1,2,3,4,5)、入力Bが(5)の場合、入力Bは(5,5,5,5,5,5)となる
#### 出力
省略

## その他
ノードにループがあると実行できません  
画面の大きさが変わると操作できなくなります(なぜ...??)
質問、意見等あればTwitterまで。バグを見つけたら教えてくれるとありがたいです。止まって動かなくなったときはF12キーでコンソールを開いてスクショを送っていただけるとちょーうれしい
