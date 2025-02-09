const formatTime = (date, split = '/') => {
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
const setOption = (chart, xData, seriesData1, seriesData2, type, legendData) => {
  let obj = {};
  let formatters = '';
  if (type == 'TT') {
    obj.val1 = '温度1';
    obj.val2 = '温度2';
    formatters = '温度1：{c0}°C \n温度2：{c1}°C \n时间：{b}'
  } else {
    obj.val1 = '温度';
    obj.val2 = '湿度';
    formatters = '温度：{c0}°C \n湿度：{c1}%RH \n时间：{b}'
  }
  var option = {
    animation: false,
    grid: {
      containLabel: true,
      bottom: 0
    },
    tooltip: {
      trigger: 'axis',
      formatter: formatters
    },
    legend: {
      left: '10',
      top: '10',
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
      name: obj.val1,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#e46161',//#e46161
      },
      itemStyle: {
        borderColor: '#e46161'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#e46161' // 0% 处的颜色
          }, {
            offset: 1,
            color: '#fff' // 100% 处的颜色
          }],
          global: false // 缺省为 false
        }
      },
      data: seriesData1
    }, {
      name: obj.val2,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#42A6FF'
      },
      itemStyle: {
        borderColor: '#42A6FF'
      },
      areaStyle: {
        color: {
          type: 'line',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#42A6FF' // 0% 处的颜色
          }, {
            offset: 1,
            color: '#fff' // 100% 处的颜色
          }],
          global: false // 缺省为 false
        }
      },
      data: seriesData2
    }]
  };
  chart.setOption(option);
}
// 字符串转buffer
const string2buffer = (str) => {
  let val = "";
  if (!str) return
  let length = str.length;
  let index = 0;
  let array = [];
  while (index < length) {
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
  })
  return hexArr.join('');
}
// 指令转换 
// const transformCode = (code, split) => {
//   let sum = 0;
//   return split.map((item, index) => {
//     let a;
//     if (index === 0 || index === split.length - 1) {
//       a = code.substr(sum * 2, item * 2)
//     } else {
//       a = parseInt(code.substr(sum * 2, item * 2), 16).toString();
//     }
//     sum += item;
//     return a;
//   })
// }
// 指令转换 
const transformCode = (code, split) => {
    let sum = 0;
    return split.map((item, index) => {
      let a;
      let b;
      if (index === 0 || index === split.length - 1) {
        a = code.substr(sum * 2, item * 2)
      } else {
        b = code.substr(sum * 2, item * 2);
        if(b.toString().substring(0,1) != 0 && b.length == 4){
          let str = parseInt('ffff', 16);
          a = '-'+((parseInt(b, 16)^str)+1).toString();
        }else{
          a = parseInt(b, 16).toString();
        }
      }
      sum += item;
      return a;
    })
  }
// 校验和
const checksum = (arr) => {
  const res = arr.map(item => parseInt(item, 16)).reduce((sum, item) => sum + item).toString(16).padStart(2, '0').slice(-2)
  return res
}
// 转换为两位十六进制字符串
const transToHexadecimal = (num, fixed = 2) => {
  return num.toString(16).padStart(fixed, '0');
}
const generateCode = (params, fixed) => {
  const arr = params.map((item, index) => {
    if (index === 0 || index === 1 || index === 2 || index === params.length - 1) {
      return item
    } else {
      return transToHexadecimal(item, fixed[index])
    }
  })
  const verify = checksum(arr.slice(1, arr.length - 1))
  arr.splice(-1, 0, verify)
  return arr.join('')
}
// 生成指令
const generateCode2 = (params, fixed) => {
  let arr = params.map((item, index) => {
    if (index === 0 || index === 1) {
      return item;
    } else {
      return transToHexadecimal(item, fixed);
    }

  });
  const verify = checksum(arr);
  return arr.reduce((sum, item) => sum + item) + verify + '0a0d';
}
// 生成指令
const generateCode3 = (params, fixed) => {
  let arr = params.map((item, index) => {
    if (index === 0 || index === 1) {
      return item;
    } else {
      return transToHexadecimal(item, fixed[index]);
    }
  });
  const verify = checksum(arr);
  return arr.reduce((sum, item) => sum + item) + verify + '0a0d';
}
module.exports = {
  string2buffer,
  ab2hex,
  formatTime,
  getDateStr,
  multiSelectorList,
  setOption,
  checksum,
  transformCode,
  generateCode,
  generateCode2,
  // generateCode3,
  transToHexadecimal
}