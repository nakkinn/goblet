let s,num=-1,bnum=-1,dx,dy,x,y;
let mode=0,mn,mx1,my1,mx2,my2;
let stone=[]; 
let board=[]
let peer,room;

function setup(){
    createCanvas(windowWidth,windowHeight);

    peer=new Peer({
        key: 'cf1155ef-ab9f-41a3-bd4a-b99c30cc0663',
        debug:1
    });
    peer.on('open',()=>{
        room=peer.joinRoom("stone",{
            mode:'sfu'
        });
        room.on('open',()=>{

        });
        room.on('peerJoin',peerId=>{
            console.log(peerId+"参加");
        });
        room.on('peerLeave',peerId=>{
            console.log(peerId+"退出");
        });
        room.on('data',message=>{
            console.log(message.data);
            receive(message.data);
        });
    });

    s=height/5;

    reset();
}

function draw(){
    background(255);

    for(let i=1;i<4;i++)    for(let j=1;j<4;j++){
        stroke(0);
        strokeWeight(1);
        noFill();
        rect(s*i+s*0.5,s*j,s,s);
    }

    for(let i=0;i<12;i++)  if(i!=num) stone[i].disp();

    if(num>=0){
        fill(100);
        circle(board[bnum].x,board[bnum].y,stone[num].r*2);
        stone[num].disp();
    }

    for(let i=0;i<21;i++){
        noStroke(),fill(0);
        circle(board[i].x,board[i].y,10);
    }

    if(num!=-1){
        stone[num].x=mouseX-dx;
        stone[num].y=mouseY-dy;
    }

    if(mode>0){
        stone[mn].x=map(mode,30,1,mx1,mx2);
        stone[mn].y=map(mode,30,1,my1,my2);
        mode--;
    }
}

function mousePressed(){
    if(mode==0) for(let i=0;i<board.length;i++){
        let d=dist(mouseX,mouseY,board[i].x,board[i].y);
        if(d<s*0.5){
            let len=board[i].stone.length;
            if(len>0){
                if(d<stone[board[i].stone[len-1]].r){
                    num=board[i].stone[len-1];
                    bnum=i;
                    x=stone[num].x;
                    y=stone[num].y;
                    dx=mouseX-board[i].x;
                    dy=mouseY-board[i].y;
                }
            }
            break;
        }
    }
}

function mouseReleased(){
    if(num>=0){
        let flag=true;
        for(let i=0;i<board.length;i++){
            let d=dist(mouseX,mouseY,board[i].x,board[i].y);
            if(d<s*0.4) if(board[i].stone.length==0||stone[num].r>stone[ board[i].stone[board[i].stone.length-1] ].r){
                stone[num].x=board[i].x;
                stone[num].y=board[i].y;
                board[bnum].stone.length--;
                board[i].stone.push(num);
                room.send(num+','+bnum+','+i);
                flag=false;
            }
        }
        if(flag){
            stone[num].x=x;
            stone[num].y=y;
        }
        num=-1;
        bnum=-1;
    }
}

function keyPressed(){
    if(key=='r'){
        room.send("reset");
        reset();
    }
}

class Stone{
    constructor(x,y,n,c){
        this.x=x;
        this.y=y;
        this.n=n;
        if(n==0)    this.r=s*0.15;
        if(n==1)    this.r=s*0.30;
        if(n==2)    this.r=s*0.45;
        this.c=c;
    }

    disp(){
        stroke(255);
        strokeWeight(3);
        fill(this.c);
        circle(this.x,this.y,this.r*2);
        strokeWeight(1);
    }
}

class Board{
    constructor(){
        this.x;
        this.y;
        this.stone=[];
    }
}

function receive(m){
    if(m=="reset"){
        reset();
    }else if(m=="close"){
        room.clome();
    }else{
        m=m.split(',');
        for(let i=0;i<3;i++)    m[i]=int(m[i]);
        board[m[1]].length--;
        board[m[2]].stone.push(m[0]);
        mx1=board[m[1]].x;
        my1=board[m[1]].y;
        mx2=board[m[2]].x;
        my2=board[m[2]].y;
        mode=30;
        mn=m[0]
    }
}

function reset(){

    for(let i=0;i<12;i++){
        let c;
        if(i%2==0)  c='#F18F01';
        else    c='#048BA8';
        stone[i]=new Stone(s*0.5+s*int(i/2),s*(0.5+4*(i%2)),int(i/4),c);
    }

    for(let i=0;i<21;i++)   board[i]=new Board();
    for(let i=0;i<6;i++){
        board[i].x=board[i+6].x=s*(0.5+i);
        board[i].y=s*0.5;
        board[i+6].y=s*4.5;
    }
    for(let i=0;i<3;i++)    for(let j=0;j<3;j++){
        board[12+i*3+j].x=s*(i+2);
        board[12+i*3+j].y=s*(j+1.5);
    }
    for(let i=0;i<12;i++){
        if(i%2==0)  board[i/2].stone[0]=i;
        else board[6+(i-1)/2].stone[0]=i;
    }   
}






















































































































































