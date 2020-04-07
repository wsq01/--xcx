var ratio = 1
var radius = 150
var deg0 = Math.PI / 9
var deg1 = Math.PI * 11 / 45
var score = 26
var stage = ['较差', '中等', '良好', '优秀', '极好']

Page({
  data: {
    canvasWidth: undefined
  },
  onLoad() {
    this.getSystemInfo()
    wx.createSelectorQuery().select('#dashboard').fields({
      node: true,
      size: true
    }).exec(this.init.bind(this))
  },
  getSystemInfo() {
    const that = this
    wx.getSystemInfo({
      success(res) {
        that.setData({
          canvasWidth: res.windowWidth
        })
      }
    })
  },
  init(res) {
    var canvas = res[0].node;
    var ctx = canvas.getContext('2d');
    var cWidth = res[0].width;
    var cHeight = res[0].height;
    canvas.width = cWidth;
    canvas.height = cHeight;
    var dot = new Dot(),
        dotSpeed = 0.05,
        textSpeed = Math.round(dotSpeed * 10 / deg1),
        angle = 0,
        credit = -30;
    var isFinished = false;
    (function drawFrame() {
        ctx.save();
        ctx.clearRect(0, 0, cWidth, cHeight);
        ctx.translate(cWidth / 2, cHeight / 2 + 50);
        ctx.rotate(8 * deg0);
    
        dot.x = radius * Math.cos(angle);
        dot.y = radius * Math.sin(angle);
    
        var aim = (score - (-30)) * deg1 / 20;
        if (angle < aim) {
          angle += dotSpeed;
        } else {
          isFinished = true
        }
        dot.draw(ctx);
    
        if (credit < score - textSpeed) {
          credit += textSpeed;
        } else if (credit >= score - textSpeed && credit < score) {
          credit += 1;
        }
        drawText(credit, ctx);
    
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
        ctx.arc(0, 0, radius, 0, angle, false);
        ctx.stroke();
        ctx.restore();
        if(!isFinished) {
          canvas.requestAnimationFrame(drawFrame)
        }
    
        ctx.save(); //中间刻度层
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
        ctx.lineWidth = 10;
        ctx.arc(0, 0, radius - 20, 0, 11 * deg0, false);
        ctx.stroke();
        ctx.restore();
    
        ctx.save(); // 刻度线
        for (var i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
          ctx.moveTo(140 * ratio, 0);
          ctx.lineTo(130 * ratio, 0);
          ctx.stroke();
          ctx.rotate(deg1);
        }
        ctx.restore();
    
        ctx.save(); // 细分刻度线
        for (i = 0; i < 25; i++) {
          if (i % 5 !== 0) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, .1)';
            ctx.moveTo(140 * ratio, 0);
            ctx.lineTo(133 * ratio, 0);
            ctx.stroke();
          }
          ctx.rotate(deg1 / 5);
        }
        ctx.restore();
    
        ctx.save(); //信用分数
        ctx.rotate(Math.PI / 2);
        for (i = 0; i < 6; i++) {
          ctx.fillStyle = 'rgba(255, 255, 255, .8)';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(-30 + 20 * i, 0, -115 * ratio);
          ctx.rotate(deg1);
        }
        ctx.restore();
    
        // ctx.save(); //分数段
        // ctx.rotate(Math.PI / 2 + deg0);
        // for (i = 0; i < 5; i++) {
        //   ctx.fillStyle = 'rgba(255, 255, 255, .8)';
        //   ctx.font = '12px sans-serif';
        //   ctx.textAlign = 'center';
        //   ctx.fillText(stage[i], 5, -115 * ratio);
        //   ctx.rotate(deg1);
        // }
        // ctx.restore();
    
        ctx.save(); //信用阶段及评估时间文字
        ctx.rotate(10 * deg0);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('温度区间：0°C~0°C', 0, 30);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
         // y-----
        ctx.fillText('开始时间：2016.11.06', 0, 50);
        ctx.fillStyle = '#7ec5f9';
        ctx.font = '14px sans-serif';
        ctx.fillText('700073', 0, -60);
        ctx.restore();

        // ctx.save(); //最外层轨道
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, .4)';
        ctx.lineWidth = 3;
        ctx.arc(0, 0, radius, 0, 11 * deg0, false);
        ctx.stroke();
        ctx.restore();
    })()
  }
})

function drawText(process, ctx) {
  ctx.save();
  ctx.rotate(10 * deg0);
  ctx.fillStyle = '#ffffff';
  ctx.font = '50px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseLine = 'top';
  ctx.fillText(process + '°C', 0, 0);
  ctx.restore();
}

function Dot(ctx) {
  this.x = 0;
  this.y = 0;
  this.draw = function (ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, .7)';
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  };
}