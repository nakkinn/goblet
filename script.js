let node=[],nodeindex=[],snode=[];
let menu;
let option=[
    ["Add +","Subtract -","Multiply *","Divide /","Surplus %"],
    ["sin","cos","tan","絶対値","符号","切り捨て","平方根","exp","log"],
    ["power","noise","constrain","dist","map"],
    ["And","Or","Not","=",">",">="],
    ["x","y","box"],
    ["RGB","HSB"]
];
//mode ０：デフォルト　１：startを選択中　２：endを選択中　３：移動　４：領域　５：入力中　６：スライダー
let startpin,num,endpin,pin,temx,temy,temx2,temy2,mode=0,img,boxn,boxp,time=0,sc=0.8,savelog=0,frame=0;
let dx=0,dy=0,dxp,dyp,domainx,domainy;
let textbox=document.getElementById('textbox');
textbox.style.visibility='hidden';
textbox.style.zIndex=1;
let run=false,nodedisp=true;
let wid=720,hei=720,xmat=[],ymat=[];

function setup(){
    let c=createCanvas(windowWidth,windowHeight);
    dxp=width/2,dyp=height/2;
    c.position(0,0);
    textbox.style.position='relative';

    img=createImage(wid,hei);
    document.oncontextmenu = (e) => { e.preventDefault(); }
    document.onselectstart = () => false;

    for(let i=0;i<hei;i++){
        xmat[i]=[];
        ymat[i]=[];
        for(let j=0;j<wid;j++){
            xmat[i][j]=j;
            ymat[i][j]=i;
        }
    }

}

function draw(){
    
    background(255);

    if(run) image(img,10,40);

    push();
    translate(width/2,height/2);
    scale(sc);
    translate(dx,dy);

    if(!run){
        for(let i=0;i<node.length;i++)    node[nodeindex[i]].linedisp();
        for(let i=0;i<node.length;i++)  node[nodeindex[i]].disp();
    }
    
    if(mode==3){    //移動
        for(let i=0;i<snode.length;i++){
            node[ [snode[i]] ].x+=(mouseX-temx)/sc;
            node[ [snode[i]] ].y+=(mouseY-temy)/sc;
        }
        temx=mouseX;
        temy=mouseY;
    }

    pop();

    if(mode==1||mode==2){   //ワイヤーの描写
        let x=mouseX,y=mouseY;
        stroke(150);
        noFill();
        
        for(let i=0;i<node.length;i++){
            if(dist(mouseX,mouseY,(node[i].x+node[i].sx+dx)*sc+dxp,(node[i].y+25+(node[i].sy-25)/2+dy)*sc+dyp)<18*sc&&node[i].type!=5){
                if(mode==2){
                    x=(node[i].x+node[i].sx+dx)*sc+dxp;
                    y=(node[i].y+25+(node[i].sy-25)/2+dy)*sc+dyp;
                }
                break;
            }
     
            for(let j=0;j<node[i].iy.length;j++)    if(dist(mouseX,mouseY,(node[i].x+dx)*sc+dxp,(node[i].y+node[i].iy[j]+dy)*sc+dyp)<18*sc&&node[i].type!=4){
                if(mode==1){
                    x=(node[i].x+dx)*sc+dxp;
                    y=(node[i].y+node[i].iy[j]+dy)*sc+dyp;
                }
                break;
            }   

        }
        if(dist(temx,temy,x,y)>20*sc){
            if(mode==1) bezier(temx,temy,temx+100,temy,x-100,y,x,y);
                else    bezier(temx,temy,temx-100,temy,x+100,y,x,y);
        }
    }

    if(mode==4||mode==4.1){
        fill('#2277ff55'),stroke('#5555bb');
        rect(domainx,domainy,mouseX-domainx,mouseY-domainy);
    }
    if(menu!=undefined) menu.disp();
    fill(0),noStroke(),textSize(12);

    if(mode==5) textbox.focus(); 
    if(mode==6) node[boxn].value=[int((constrain(mouseX-(node[boxn].x+dx)*sc-dxp,12*sc,120*sc)-12*sc)/1.08/sc)]; 
   
    gui();
    
}


function mousePressed(){
    if(mode==5) input();
    if(mouseButton==LEFT)   pressleft();
    if(mouseButton==RIGHT)  pressright();

}

function pressleft(){

    let action=false;
    if(mouseY<30){
        if(dist(mouseX,mouseY,22.5,15)<15){
            if(run==false)  runnode();
            run=!run;
        }

        if(dist(mouseX,mouseY,142.5,15)<15)  savenode();
        if(dist(mouseX,mouseY,202.5,15)<15)  loadnode();
    }else if(run==false){
        for(let i=0;i<node.length;i++){
            let ip=nodeindex[node.length-i-1];
            //出力ソケット
            if(dist(mouseX, mouseY, (node[ip].x+node[ip].sx+dx)*sc+dxp ,(node[ip].y+25+(node[ip].sy-25)/2+dy)*sc+dyp )<18*sc&&node[ip].type!=5){
                startpin=ip;
                mode=1;
                temx=(node[ip].x+node[ip].sx+dx)*sc+dxp;
                temy=(node[ip].y+25+(node[ip].sy-25)/2+dy)*sc+dyp;
                action=true;
                snode.length=0;
                break;
            }
            
            for(let j=0;j<node[ip].iy.length;j++){
                //入力ソケット
                if(dist(mouseX,mouseY,(node[ip].x+dx)*sc+dxp, (node[ip].y+node[ip].iy[j]+dy)*sc+dyp )<18*sc&&node[ip].type!=4){
                    cutsocket(ip,j);
                    endpin=ip;
                    pin=j;
                    mode=2;
                    temx=(node[ip].x+dx)*sc+dxp;
                    temy=(node[ip].y+node[ip].iy[j]+dy)*sc+dyp;
                    action=true;
                    snode.length=0;
                    break;
                }
                //テキストボックス
                if(mouseX>(node[ip].x+10+dx)*sc+dxp &&mouseX<(node[ip].x+10+78+dx)*sc+dxp &&mouseY>(node[ip].y+node[ip].iy[j]-10+dy)*sc+dyp&&
                    mouseY<(node[ip].y+node[ip].iy[j]-10+20+dy)*sc+dyp &&node[ip].in[j]==undefined){
                    boxn=ip;
                    boxp=j;
                    if(node[ip].valueb[j]!=undefined)  textbox.value=node[ip].valueb[j];
                    else    textbox.value='';
                    textbox.style.left=(node[ip].x+9+dx)*sc+dxp+'px';
                    textbox.style.top=(node[ip].y+node[ip].iy[j]-12+dy)*sc+dyp+'px';
                    textbox.style.width=72*sc+'px';
                    textbox.style.height=16*sc+'px';
                    textbox.style.visibility='visible';
                    mode=5;
                    action=true;
                    snode.length=0;
                    break;
                }
            }
            if(action==true)    break;

            if(node[ip].name=="slider"&&mouseX>=(node[ip].x+dx)*sc+dxp && mouseX<(node[ip].x+node[ip].sx+dx)*sc+dxp &&
            mouseY>(node[ip].y+45+dy)*sc+dyp&&mouseY<(node[ip].y+75+dy)*sc+dyp){
                mode=6;
                boxn=ip;
                action=true;
                break;
            }

            //枠内
            if(mouseX>=(node[ip].x+dx)*sc+dxp && mouseX<(node[ip].x+node[ip].sx+dx)*sc+dxp && mouseY>=(node[ip].y+dy)*sc+dyp &&
            mouseY<(node[ip].y+node[ip].sy+dy)*sc+dyp){
                action=true;
                mode=3;
                num=ip;
                temx=temx2=mouseX;
                temy=temy2=mouseY;
                if(keyIsPressed==false||keyCode!=SHIFT){
                    if(snode.includes(ip)==false){
                        snode[0]=ip;
                        snode.length=1;
                    }
                }else{
                    snode[snode.length]=ip;
                }
                let tem=nodeindex.indexOf(ip);
                nodeindex.splice(tem,1);
                nodeindex.push(ip);
                break;
            }

        }

        //余白
        if(action==false){
            if(keyIsPressed&&keyCode==SHIFT)    mode=4.1;
            else    mode=4;
            domainx=mouseX;
            domainy=mouseY;
            snode.length=0;
        }
    }

    if(menu!=undefined){    //右クリックメニュー
        if(menu.m>=0){
            node[node.length]=new Node((mouseX+4-dxp)/sc-dx,(mouseY+4-dyp)/sc-dy,node.length,option[menu.n][menu.m]);
            menu=undefined;
        }else   if(menu.m==-1&&menu.n==-1)  menu=undefined;
    }
}

function pressright(){
    if(run==false)  menu=new Menu(constrain(mouseX-110,0,width-300),constrain(mouseY-10,0,height-271));
}


function mouseReleased(){

    if(mode==1||mode==2){
        for(let i=0;i<node.length;i++){
            if(dist(mouseX,mouseY,(node[i].x+node[i].sx+dx)*sc+dxp,(node[i].y+25+(node[i].sy-25)/2+dy)*sc+dyp)<18*sc&&node[i].type!=5){
                if(mode==2){
                    node[i].out[ node[i].out.length ]=endpin;
                    node[i].outp[ node[i].outp.length ]=pin;
                    node[endpin].in[pin]=i;
                    mode=0;
                }
                break;
            }
     
            for(let j=0;j<node[i].iy.length;j++)    if(dist(mouseX, mouseY, (node[i].x+dx)*sc+dxp, (node[i].y+node[i].iy[j]+dy)*sc+dyp)<18*sc&&node[i].type!=4){
                cutsocket(i,j);
                if(mode==1){
                    node[startpin].out[ node[startpin].out.length ]=i;
                    node[startpin].outp[ node[startpin].outp.length ]=j;
                    node[i].in[j]=startpin;
                    mode=0;
                }
                break;
            }   
        }
    } 
    if(mode==4||mode==4.1){
        //if(mode==4) snode.length=0;
        for(let i=0;i<node.length;i++){
            if((node[i].x+node[i].sx+dx)*sc+dxp>min(domainx,mouseX) && (node[i].x+dx)*sc+dxp<max(domainx,mouseX) &&
            (node[i].y+node[i].sy+dy)*sc+dyp>min(domainy,mouseY) && (node[i].y+dy)*sc+dyp<max(domainy,mouseY)){
                snode[snode.length]=i;
            }
        }
    }

    if(snode.length>0){
        if(mouseX==temx2&&mouseY==temy2&&(keyIsPressed==false||keyCode!=SHIFT)){
            snode.length=0;
            snode[0]=num;
        }
    }

    
    if(mode!=5) mode=0;

}


function mouseDragged(){
    if(mouseButton==CENTER&&nodedisp){
        dx+=(mouseX-pmouseX)/sc;
        dy+=(mouseY-pmouseY)/sc;
    }
}


function mouseWheel(event){
    if(run==false){
        if(mode==5) input();
        mode=0;
        let tem=0.0005*event.deltaY;
        if(event.deltaY>0)    sc=(sc*10-1)/10;
        else sc=(sc*10+1)/10;
        sc=constrain(sc,0.1,3);
        if(sc<=0.2||sc>=3)  tem=0;
    }
}


function keyPressed(){

    if(keyCode==DELETE&&mode!=5){   //削除
        for(let k=0;k<snode.length;k++){
            deletenode(snode[k]);
            for(let i=k;i<snode.length;i++) if(snode[i]>snode[k])  snode[i]--;
        } 
        snode.length=0;
    }

    if(key=='v'&&mode!=5){  //複製
        n=node.length;
        for(let i=0;i<snode.length;i++){
            node[node.length]=new Node(node[snode[i]].x+100,node[snode[i]].y+100,node.length,node[snode[i]].name);
            node[node.length-1].in.length=0;
            node[node.length-1].out.length=0;
            node[node.length-1].outp.length=0;
            for(let j=0;j<node[node.length-1].iy.length;j++)    node[node.length-1].valueb[j]=node[snode[i]].valueb[j];   
        }
        for(let i=0;i<snode.length;i++) for(let j=0;j<node[snode[i]].out.length;j++){
            if(snode.includes(node[snode[i]].out[j])){
                node[n+i].out[ node[n+i].out.length ]=n+snode.indexOf(node[snode[i]].out[j]);
                node[n+i].outp[ node[n+i].outp.length ]=node[snode[i]].outp[j];
                node[ n+snode.indexOf(node[snode[i]].out[j]) ].in[ node[snode[i]].outp[j] ]=n+i;
            }
        }
        for(let i=0;i<snode.length;i++) snode[i]=n+i;
    }

    if(key=='s'&&mode!=5&&run)  img.save();

    if(keyCode==ENTER&&mode==5) input();

}


function cutsocket(a,b){    //a:ノード番号　b:入力番号
    if(node[a].in[b]!=undefined){
        let index;
        let tema=[],temb=[];
        for(let i=0;i<node[ node[a].in[b] ].out.length;i++){
            if(node[ node[a].in[b] ].out[i]==a) tema[i]=true;
            else    tema[i]=false;
            if(node[ node[a].in[b] ].outp[i]==b) temb[i]=true;
            else    temb[i]=false;
        }
        for(let i=0;i<tema.length;i++){
            if(tema[i]&&temb[i]){
                index=i;
                break;
            }
        }
        node[  node[a].in[b] ].out.splice(index,1);
        node[  node[a].in[b] ].outp.splice(index,1);
        node[a].in[b]=undefined;
        //node[a].valuei[b].length=0;
    }
}


function interpret(s){
    if(s=="x")  return xmat.concat();
    if(s=="y")  return ymat.concat();
    if(s=="pi") return PI;
    if(isNaN(s))    return 0;
    else    return Number(s);
}

function input(){
    node[boxn].valueb[boxp]=textbox.value;
    textbox.blur();
    mode=0;
    textbox.style.visibility='hidden';
}

function search(){
    let n=-1,len=node.length;

    if(mouseX==pmouseX&&mouseY==pmouseY){
        time++;
    }else   time=0;

    for(let i=0;i<len;i++){
        if(mouseX>node[nodeindex[len-i-1]].x*sc+dx&&mouseX<(node[nodeindex[len-i-1]].x+node[nodeindex[len-i-1]].sx)*sc+dx
            &&mouseY>(node[nodeindex[len-i-1]].y)*sc+dy&&mouseY<(node[nodeindex[len-i-1]].y+node[nodeindex[len-i-1]].sy)*sc+dy){
            n=nodeindex[len-i-1];
            break;
        }
    }

    if(n>-1&&time>30){
        fill(0,100),noStroke();
        rect(mouseX+20,mouseY,100,(node[n].value.length+1)*20);
        fill(255),noStroke();
        text("No."+n,mouseX+30,mouseY+14);
        for(let i=0;i<node[n].value.length;i++){
            text(i,mouseX+30,mouseY+30+20*i);
            text(node[n].value[i].toFixed(2),mouseX+60,mouseY+30+20*i);
        }
        
    }
}


class Node{
    constructor(x,y,n,name){
        
        this.name,this.type,this.x=x,this.y=y,this.n=n;
        this.in=[],this.out=[],this.outp=[];
        this.value=[],this.valuei=[],this.valueb=[];
        this.sx,this.sy,this.iy=[];
        this.error;
        this.data=[];

        nodeindex.push(n);
        this.setting(name);
        
    }

    setting(name){
        let re=true;
        if(this.name==undefined)    re=false;

        this.name=name;

        for(let i=0;i<option.length;i++){
            if(option[i].includes(name)){
                this.type=i;
            }
        }

        this.sx=115;
        if(name=="x"||name=="y")    this.iy.length=0;
        if(name=="box"||name=="Not"||this.type==1) this.iy.length=1;
        if(this.type==0||(this.type==3&&this.name!="Not")||this.name=="noise"||this.name=="power")  this.iy.length=2;
        if(this.name=="constrain"||this.type==5)    this.iy.length=3;
        if(name=="dist")    this.iy.length=4;
        if(name=="map") this.iy.length=5;
    
        this.in.length=this.iy.length;

        this.sy=37.5*(this.iy.length+1);
        for(let i=0;i<this.iy.length;i++)   this.iy[i]=50+37.5*i;

        if(name=="x"||name=="y"){
            this.sy=75;
        }

        if(this.in.length>this.iy.length)   for(let i=this.iy.length;i<this.in.length;i++)  cutsocket(this.n,i);
            
        this.valuei.length=this.valueb.length=this.iy.length;
        
    }

    disp(){
        noFill(),stroke(0);
        if(snode.includes(this.n)) fill(0,30);
        if(this.error)  stroke("#ff3333");
        rect(this.x,this.y,this.sx,this.sy);    //外枠

        if(this.type==4)   fill('#ff7f7f'); //ヘッダー
        if(this.type==0)   fill('#7fbfff');
        if(this.type==1)   fill(150);
        if(this.type==2)    fill(90);
        if(this.type==3)    fill('#4d994d');
        if(this.type==5) fill('#ffbf7f');
        noStroke();
        rect(this.x,this.y,this.sx,25); 

        fill(255);  //名前
        strokeWeight(0.5);
        rect(this.x+3,this.y+5,80,16);
        fill(0);
        noStroke();
        textSize(14);
        text(this.name,this.x+5,this.y+17);
        textAlign(RIGHT);
        text(this.n,this.x+this.sx-15,this.y+17)
        textAlign(LEFT);
        strokeWeight(1);

        noStroke(); //入出力ピン
        fill(100);
        if(this.type!=4) for(let i=0;i<this.iy.length;i++){
            circle(this.x,this.y+this.iy[i],15);
        }
        if(this.type!=5)   circle(this.x+this.sx,this.y+25+(this.sy-25)/2,15);

        for(let i=0;i<this.iy.length;i++){  //入力ボックス
            if(this.in[i]==undefined){
                if(mode!=5||boxn!=this.n||boxp!=i){
                    fill(255),stroke(0),strokeWeight(1);           
                    rect(this.x+10,this.y+this.iy[i]-10,78,20,2);
                    fill(0),noStroke(),textSize(14);
                    text(this.valueb[i],this.x+12,this.y+this.iy[i]+5); 
                }
            }
        }

        if(this.name=="slider"){
            text(this.value,this.x+5,this.y+this.sy-5);
            strokeWeight(9);
            stroke(180);
            line(this.x+12,this.y+60,this.x+120,this.y+60);
            stroke('#0060ff')
            line(this.x+12,this.y+60,this.x+map(this.value,0,100,12,120),this.y+60);
            fill('#0060ff');
            circle(this.x+map(this.value,0,100,12,120),this.y+60,8);
            strokeWeight(1);
        }
        

    }

    linedisp(){
        

        for(let i=0;i<this.out.length;i++){
            noFill();
            stroke(0);
            let x1,y1,x2,y2;
            x1=this.x+this.sx;
            y1=this.y+25+(this.sy-25)/2;
            x2=node[ this.out[i] ].x;
            y2=node[ this.out[i] ].y+node[ this.out[i] ].iy[ this.outp[i] ];
            if(x1<x2-10)   bezier(x1,y1,(x1+x2)/2,y1,(x1+x2)/2,y2,x2,y2);
            else    bezier(x1,y1,x1+100,y1,x2-100,y2,x2,y2);
        }
    }

    calculate(){

        if(this.name=="x"){
            this.value=xmat.concat();
        }
        if(this.name=="y"){
            this.value=ymat.concat();
        }
        if(this.name=="box"){
            this.value=interpret(this.valuei[0]);
        }

        for(let i=0;i<this.iy.length;i++){
            if(this.in[i]==undefined){
                this.valuei[i]=interpret(this.valueb[i]);
            }   
        }

        let tem=new Array(this.iy.length);
        if(this.type<4||this.name=="box"){

            for(let i=0;i<this.iy.length;i++){
                if(Array.isArray(this.valuei[i]))    tem[i]=this.valuei[i];
                else{
                    tem[i]=[];
                    for(let j=0;j<hei;j++){
                        tem[i][j]=[];
                        for(let k=0;k<wid;k++)  tem[i][j][k]=this.valuei[i]; 
                    }  
                }
            }

            this.value=[];
            for(let i=0;i<hei;i++)  this.value[i]=[];
            
        }

        if(this.name=="box")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j];

        if(this.name=="sin")    
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=sin(tem[0][i][j]);
        if(this.name=="cos")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=cos(tem[0][i][j]);
        if(this.name=="tan")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tan(tem[0][i][j]);
        if(this.name=="絶対値")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=abs(tem[0][i][j]);
        if(this.name=="符号")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j]/abs(tem[0][i][j]);
        if(this.name=="切り捨て")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=int(tem[0][i][j]);
        if(this.name=="平方根")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=sqrt(tem[0][i][j]);
        
        if(this.name=="exp")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=exp(tem[0][i][j]);
        if(this.name=="log")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=log(tem[0][i][j]);

        if(this.name=="Add +")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j]+tem[1][i][j];
        if(this.name=="Subtract -")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j]-tem[1][i][j];
        if(this.name=="Multiply *")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j]*tem[1][i][j];
        if(this.name=="Divide /")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j]/tem[1][i][j];
        if(this.name=="Surplus %")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=tem[0][i][j]%tem[1][i][j];

        if(this.name=="power")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=pow(tem[0][i][j],tem[1][i][j]);
        if(this.name=="noise")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=noise(tem[0][i][j],tem[1][i][j]);
        if(this.name=="constrain")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=constrain(tem[0][i][j],tem[1][i][j],tem[2][i][j]);
        if(this.name=="dist")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=dist(tem[0][i][j],tem[1][i][j],tem[2][i][j],tem[3][i][j]);
        if(this.name=="map")
            for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++)  this.value[i][j]=map(tem[0][i][j],tem[1][i][j],tem[2][i][j],tem[3][i][j],tem[4][i][j]);

        if(this.name=="And")   for(let i=0;i<hei;i++)   for(let j=0;j<wid;j++)    
            if(tem[0][i][j]!=0&&tem[1][i][j]!=0)   this.value[i][j]=1;    else    this.value[i][j]=0;
        if(this.name=="Or")   for(let i=0;i<hei;i++)   for(let j=0;j<wid;j++)    
            if(tem[0][i][j]!=0||tem[1][i][j]!=0)   this.value[i][j]=1;    else    this.value[i][j]=0;
        if(this.name=="Not")   for(let i=0;i<hei;i++)   for(let j=0;j<wid;j++)    
            if(tem[0][i][j]==0)   this.value[i][j]=1;    else    this.value[i][j]=0;
        if(this.name=="=")   for(let i=0;i<hei;i++)   for(let j=0;j<wid;j++)    
            if(tem[0][i][j]==tem[1][i][j])   this.value[i][j]=1;    else    this.value[i][j]=0;
        if(this.name==">")   for(let i=0;i<hei;i++)   for(let j=0;j<wid;j++)    
            if(tem[0][i][j]>tem[1][i][j])   this.value[i][j]=1;    else    this.value[i][j]=0;
        if(this.name==">=")   for(let i=0;i<hei;i++)   for(let j=0;j<wid;j++)    
            if(tem[0][i][j]>=tem[1][i][j])   this.value[i][j]=1;    else    this.value[i][j]=0;

    }

    flow(){  
        for(let i=0;i<this.out.length;i++){
           node[ this.out[i] ].valuei[ this.outp[i] ]=this.value;
        }
    }

}


class Menu{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.sx=150;
        this.sy=30;
        this.n=-1;
        this.m=-1;
        this.group=["基本演算","演算A","演算B","論理演算","入力","出力"];
    }

    disp(){
    
        textAlign(LEFT,CENTER);
        textSize(18);
        if(this.over()){
            if(mouseX<this.x+this.sx)   this.n=int((mouseY-this.y)/this.sy),this.m=-1;
            else    this.m=int((mouseY-this.y-this.sy*this.n)/this.sy);
        }else this.n=-1,this.m=-1;

        stroke(0);
        rect(this.x,this.y,this.sx,this.sy*this.group.length);
        noStroke();
        for(let i=0;i<this.group.length;i++){
            if(this.n==i)   fill(230);
                else    fill(255);
            rect(this.x,this.y+this.sy*i,this.sx,this.sy);
            fill(0);
            text(this.group[i],this.x+5,this.y+this.sy*i+this.sy/2);
        }

        if(this.n>=0){
            stroke(0);
            rect(this.x+this.sx-2,this.y+this.sy*this.n,this.sx+2,this.sy*option[this.n].length);
            noStroke();
            for(let i=0;i<option[this.n].length;i++){
                if(this.m==i)   fill(230);  
                else    fill(255);
                rect(this.x+this.sx-2,this.y+this.sy*this.n+this.sy*i,this.sx+2,this.sy);
                fill(0);
                text(option[this.n][i],this.x+this.sx-2+5,this.y+this.sy*this.n+this.sy*i+this.sy/2);
            }
        }
        textAlign(LEFT,BASELINE);
    }

    over(){
        if(mouseX>=this.x&&mouseX<this.x+this.sx&&mouseY>=this.y&&mouseY<this.y+this.sy*this.group.length)    return true;
        else if(this.n>=0)  if(mouseX>=this.x+this.sx&&mouseX<this.x+this.sx*2&&mouseY>=this.y+this.sy*this.n&&mouseY<this.y+this.sy*option[this.n].length+this.sy*this.n) return true;
        else  return false;
    }
}

function windowResized(){
    resizeCanvas(windowWidth,windowHeight);
}

function deletenode(n){
    let tem=node[n].out.length;
    for(let i=0;i<tem;i++){
        cutsocket(node[n].out[0],node[n].outp[0]);
    }
    for(let i=0;i<node[n].iy.length;i++)    cutsocket(n,i);

    node.splice(n,1);

    for(let i=0;i<node.length;i++){
        if(node[i].n>n) node[i].n--;
        for(let j=0;j<node[i].iy.length;j++){
            if(node[i].in[j]>n) node[i].in[j]--;
        }
        for(let j=0;j<node[i].out.length;j++){
            if(node[i].out[j]>n)    node[i].out[j]--;
        }            
    }    

    tem=nodeindex.indexOf(n);
    nodeindex.splice(tem,1); 
    for(let i=0;i<nodeindex.length;i++) if(nodeindex[i]>n)  nodeindex[i]--;
}

function savenode(){
    clearStorage();
    storeItem('nodelength',node.length);
    for(let i=0;i<node.length;i++){
        storeItem(i+'name',node[i].name);
        storeItem(i+'x',node[i].x);
        storeItem(i+'y',node[i].y);
        storeItem(i+'outn',node[i].out.length);
        for(let j=0;j<node[i].iy.length;j++){
            storeItem(i+','+j+'in',node[i].in[j]);
            storeItem(i+','+j+'box',node[i].valueb[j]);
        }
        for(let j=0;j<node[i].out.length;j++){
            storeItem(i+','+j+'out',node[i].out[j]);
            storeItem(i+','+j+'outp',node[i].outp[j]);
        }  
    }
    savelog=200;
}

function loadnode(){
    snode.length=0;
    nodeindex.length=0;
    let tem=node.length;
    for(let i=0;i<tem;i++){
        deletenode(tem-i-1);
    }

    let n=int(getItem('nodelength'));
    for(let i=0;i<n;i++){
        node[i]=new Node(float(getItem(i+'x')),float(getItem(i+'y')),i,getItem(i+'name'));
        for(let j=0;j<node[i].iy.length;j++){
            if(getItem(i+','+j+'in')!="undefined")    node[i].in[j]=int(getItem(i+','+j+'in'));
            if(getItem(i+','+j+'box')!="undefined")    node[i].valueb[j]=getItem(i+','+j+'box');
        }
        let outn=int(getItem(i+'outn'));
        for(let j=0;j<outn;j++){
            if(getItem(i+','+j+'out')!="undefined")    node[i].out[j]=int(getItem(i+','+j+'out'));
            if(getItem(i+','+j+'outp')!="undefined")    node[i].outp[j]=int(getItem(i+','+j+'outp'));
        }
    }
}

function runnode(){
    let order=[];

    let nodec=new Array(node.length);
    let nodef=new Array(node.length);
    let nodes=new Array(node.length);
    let noder=[],log=[];
    for(let i=0;i<nodes.length;i++)  nodes[i]=-2;
    let n,start,error=false;
    for(let i=0;i<node.length;i++){
        nodec[i]=node[i].in.concat();
        if(node[i].type==5) start=i;
    }
    
    log[0]=n=start;
    if(start!=undefined)  for(let k=0;k<9999999;k++){
        let flag=true;
        for(let i=0;i<nodec[n].length;i++){
            if(nodec[n][i]!=undefined){
                let tem=n;
                n=nodec[n][i];
                nodec[tem][i]=undefined;
                nodef[n]=tem;
                nodes[n]=k;
                if(log.indexOf(n)>=0)   error=true;   
                log[log.length]=n;
                flag=false;
                break;
            }
        }
        if(flag){
            if(n==start){
                break;
            }else{
                nodec[n]=node[n].in.concat();
                n=nodef[n];
                log.pop();
            }
        }
        if(error)   break;
    }

    let cou=0;
    for(let i=0;i<nodes.length;i++) if(nodes[i]!=-2)    cou++;

    for(let i=0;i<cou;i++){
        noder[i]=nodes.indexOf(Math.max.apply(null,nodes));
        nodes[nodes.indexOf(Math.max.apply(null,nodes))]=-2;
    }
    
    if(error)   noder=[];
    order=noder.concat([start])
    //console.log(order);

    if(order[0]!=undefined){
        for(let i=0;i<order.length;i++){
            node[order[i]].calculate();
            node[order[i]].flow();
        }
        
        let tem=[],n=order[order.length-1];

        for(let i=0;i<3;i++){
            if(Array.isArray(node[n].valuei[i])){
                tem[i]=node[n].valuei[i];
            }else{
                tem[i]=[];
                for(let j=0;j<hei;j++){
                    tem[i][j]=[];
                    for(let k=0;k<wid;k++)  tem[i][j][k]=node[n].valuei[i];
                }
            }
        }
        
        
        img.loadPixels();
        
        for(let i=0;i<hei;i++)  for(let j=0;j<wid;j++){
            if(node[n].name=="RGB"){
                img.pixels[(i*wid+j)*4]=tem[0][i][j];
                img.pixels[(i*wid+j)*4+1]=tem[1][i][j];
                img.pixels[(i*wid+j)*4+2]=tem[2][i][j];
            }else{
                img.pixels[(i*wid+j)*4]=hsbto(tem[0][i][j],tem[1][i][j],tem[2][i][j])[0];
                img.pixels[(i*wid+j)*4+1]=hsbto(tem[0][i][j],tem[1][i][j],tem[2][i][j])[1];
                img.pixels[(i*wid+j)*4+2]=hsbto(tem[0][i][j],tem[1][i][j],tem[2][i][j])[2];  
            }
            img.pixels[(i*wid+j)*4+3]=255;
        }
        img.updatePixels();
        
        
    }
}


function gui(){

    fill('#007acc');
    rect(0,0,width,30);

    if(dist(mouseX,mouseY,22.5,15)<15){
        fill('#209aec'),noStroke();
        rect(2.5,0,40,30);
    }
    fill(255);
    if(run) square(14,6,18);
    else    triangle(15,5,15,25,30,15);

    if(dist(mouseX,mouseY,142.5,15)<15){
        fill('#209aec'),noStroke();
        rect(122.5,0,40,30);
    }
    stroke(255);
    strokeWeight(2);
    line(132,15,132,25);
    line(153,15,153,25);
    line(132,25,153,25);
    line(142.5,5,142.5,20);
    line(142.5,20,148,15);
    line(142.5,20,137,15);

    if(dist(mouseX,mouseY,202.5,15)<15){
        fill('#209aec'),noStroke();
        rect(182.5,0,40,30);
    }
    stroke(255);
    line(192,15,192,25);
    line(213,15,213,25);
    line(192,25,213,25);
    line(202.5,5,202.5,20);
    line(202.5,5,208,10);
    line(202.5,5,197,10);
    strokeWeight(1);

    if(savelog>0){
        fill(255),noStroke();
        text("セーブしました",300,20);
        savelog--;
    }
}

function hsbto(h,s,b){
    if(h<0) h+=ceil(int(abs(h/360)+1)*360);
    if(h>=360)   h=h%360;

    let max,min,result=[];
    max=b;
    min=max-((s/255)*max);
    if(h<60){
        result[0]=max;
        result[1]=h/60*(max-min)+min;
        result[2]=min;
    }else if(h<120){
        result[0]=(120-h)/60*(max-min)+min;
        result[1]=max;
        result[2]=min;
    }else if(h<180){
        result[0]=min;
        result[1]=max;
        result[2]=(h-120)/60*(max-min)+min;
    }else if(h<240){
        result[0]=min;
        result[1]=(240-h)/60*(max-min)+min;
        result[2]=max;
    }else if(h<300){
        result[0]=(h-240)/60*(max-min)+min;
        result[1]=min;
        result[2]=max;
    }else if(h<360){
        result[0]=max;
        result[1]=min;
        result[2]=(360-h)/60*(max-min)+min;
    }

    return result;
}


