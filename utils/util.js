const formatTime = (date, split='/') => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join(split) + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const getDateStr = (today, addDayCount) => {
  var dd;
  if (today) {
    dd = new Date(today);
  } else {
    dd = new Date();
  }
  dd.setDate(dd.getDate() + addDayCount); //获取AddDayCount天后的日期 
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1; //获取当前月份的日期 
  var d = dd.getDate();
  if (m < 10) {
    m = '0' + m;
  };
  if (d < 10) {
    d = '0' + d;
  };
  var hh = dd.getHours();
  var mm = dd.getMinutes();
  var ss = dd.getSeconds();
  return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
}
const multiSelectorList = () => {
  const date = new Date();
  const years = [];
  const months = [];
  const days = [];
  const hours = [];
  const minutes = [];
  const seconds = [];
  //获取年
  for (let i = 2019; i <= date.getFullYear() + 6; i++) {
    years.push("" + i);
  }
  //获取月份
  for (let i = 1; i <= 12; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    months.push("" + i);
  }
  //获取日期
  for (let i = 1; i <= 31; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    days.push("" + i);
  }
  //获取小时
  for (let i = 0; i < 24; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    hours.push("" + i);
  }
  //获取分钟
  for (let i = 0; i < 60; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    minutes.push("" + i);
  }
  //获取分钟
  for (let i = 0; i < 60; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    seconds.push("" + i);
  }
  return [
    years,
    months,
    days,
    hours,
    minutes,
    seconds
  ]
}
const setOption = (chart, xData, seriesData1, seriesData2, legendData) => {
  var option = {
    animation: false,
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    legend: {
      data: legendData
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '温度',
      type: 'line',
      smooth: true,
      data: seriesData1
    }, {
      name: '湿度',
      type: 'line',
      smooth: true,
      data: seriesData2
    }]
  };
  chart.setOption(option);
}
// 字符串转buffer
const string2buffer = (str) => {
  let val = "";
  if(!str) return;
  let length = str.length;
  let index = 0;
  let array = [];
  while(index <length) {
    array.push(str.substring(index, index + 2));
    index = index + 2;
  }
  val = array.join(",");
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}

// 将ArrayBuffer转换成字符串
const ab2hex = (buffer) => {
  var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return ('00' + bit.toString(16)).slice(-2);
  }
  )
  return hexArr.join('');
}

module.exports = {
  string2buffer,
  ab2hex,
  formatTime,
  getDateStr,
  multiSelectorList,
  setOption
}
