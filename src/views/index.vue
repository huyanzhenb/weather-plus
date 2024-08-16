<script setup>
import * as echarts from 'echarts'
import { onMounted,ref } from 'vue';
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import axios from 'axios'

const chart = ref();
const chart1 = ref(); 
let city = ref('北京')
let city2 = ref('北京')
let weather = ref({})
let location = ref();  //用于存储获取到的城市 ID
let daily = ref([]);  //天气指数
let hourly = ref();  //每小时数据
let air = ref([])   //空气质量

//搜索
const search = async()=>{
  city2.value = city.value;
  //获取地区的LocationID
  let res1 = await axios.get('https://geoapi.qweather.com/v2/city/lookup',{
    params:{
      key: '7a69e52076a74e23b48c50fad80ce32c',
      location:city.value,   //输入的城市名
    }
  })
  
  location.value = res1.data.location[0].id;
  console.log(location.value)
  //实时天气
  let res = await axios.get('https://devapi.qweather.com/v7/weather/now',{
    params:{
          location:location.value,  
          key: '7a69e52076a74e23b48c50fad80ce32c'
    }
  });
  console.log(res.data)
  weather.value = res.data.now;
  //天气指数
  let res2 = await axios.get('https://devapi.qweather.com/v7/indices/1d',{
        params:{
          location:location.value,  
          key: '7a69e52076a74e23b48c50fad80ce32c',
          type:'0'
    }
  })
  daily.value = res2.data.daily
  console.log(daily.value)
  
  //每小时的数据
  let res3 = await axios.get('https://devapi.qweather.com/v7/weather/24h',{
    params:{
          location:location.value,  
          key: '7a69e52076a74e23b48c50fad80ce32c',
    }
  })
  hourly.value = res3.data.hourly.slice(0,10)
  console.log( hourly.value);

    //空气质量
    let res4 = await axios.get('https://devapi.qweather.com/v7/air/now',{
      params:{
          location:location.value,  
          key: '7a69e52076a74e23b48c50fad80ce32c',
      }
    })
    air.value = res4.data.now
    console.log(air.value)

  chartInit()
  chartInit1()
}
onMounted(()=>{
  search()
})
//每小时数据 柱状图
function chartInit(){
  let myChart = echarts.init(chart.value);

  //指定图表的配置项和数据
  let option = {
    tooltip:{},   //提示框组件，当鼠标移到图表上的可以看到提示
    xAxis: {
      type: 'category',
      data: hourly.value.map(item=>item.fxTime.substring(11,16)),
      axisLine:{   //坐标轴线相关设置
        lineStyle:{
          color:'#fff'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine:{
        lineStyle:{
          color:'#fff'
        }
      },
      splitLine:{
        lineStyle:{
          color:'#fff'
        }
      }
    },
    series: [
      {
        name:'气温',
        data: hourly.value.map(item=>item.temp),
        type: 'bar',
        itemStyle:{
          color:'red'   //设置柱状的颜色
        },
        barWidth:'40%',   //柱宽
        label:{
          show:true,   
          position:'top',
          color:'#fff',
          formatter:'{c}℃'
        }
       }
    ]
  }
  myChart.setOption(option);
}
  //空气质量
  function chartInit1(){
    let myChart = echarts.init(chart1.value);
    let option = {
           series:[
            {
              type:'gauge',
              max:200,
              title:{
                color:'#FED624',
              },
              data:[
                {
                  value:air.value.aqi,
                  name:air.value.category
                }
              ],
              axisLine:{
                lineStyle:{
                  color:[[0.25,'#8CD2AF'],[0.7,'#1EB04D'],[0.9,'#D73C31'],[2,'#6E2211']]
                }
              },
              axisLabel:{
                show:false
              },
              axisTick:{
                show:false
              },
              detail:{
                fontSize:40,
                color:'#FED624',
                offsetCenter:[0,'-30%'],
                formatter:'{value}',
              }
            }
           ]
        }
    myChart.setOption(option);
}


</script>

<template>
 <div class="container">
     <!--搜索框  -->
      <div class="search">
        <div class="search-item weatherWidth">
            <input type="text" placeholder="请输入城市名" v-model="city">
            <button class="iconfont icon-sousuo" @click="search"></button>
        </div>
      </div>
      <!-- 今日天气 -->
      <div class="weather weatherWidth">
        <div class="weather-left">
            <div class="labelWeather">{{city2}}天气</div>
            <div class="weather-summary">
              <img :src="`/src/assets/images/${weather.icon}.svg`" alt="">
              <p class="weather-temp">{{weather.temp }}<span class="celsius">℃</span></p>
              <div class="weather-describe">
                <div class="weather-text">{{weather.text }}</div>
                <div class="wether-feelslike">体感温度 {{weather.feelsLike }}°</div>
              </div>
            </div>
            <div class="weather-item">
              <ul>
                <li>
                  <div class="item-title">风向</div>
                  <div class="item-details">{{weather.windDir }}</div>
                </li>
                 <li>
                  <div class="item-title">风力等级</div>
                  <div class="item-details">{{weather.windScale }}级</div>
                </li>
                 <li>
                  <div class="item-title">相对温度</div>
                  <div class="item-details">{{weather.humidity}}%</div>
                </li>
                 <li>
                  <div class="item-title">大气压强</div>
                  <div class="item-details">{{weather.pressure }}hpa</div>
                </li>
                 <li>
                  <div class="item-title">能见度</div>
                  <div class="item-details">{{weather.vis }}公里</div>
                </li>
                 <li>
                  <div class="item-title">云量</div>
                  <div class="item-details">{{weather.cloud }}%</div>
                </li>
              </ul>
            </div>
            <!-- 天气指数 -->
            <p v-if="daily.length >= 2">{{daily[2].text || ''}}{{daily[4].text || ''}}</p>
        </div>
        <div class="weather-right">
          <div class="labelWeather">空气质量</div>
          <!-- 仪表盘 -->
          <div style="widht:100%;height:220px;text-align:center">
              <div ref="chart1" style="width:100%;height:90%"></div>
              <div>空气质量指数等级 {{air.level}}级</div>
          </div>
        </div>
      </div>
      
      <!-- 生活指数 -->
      <div class="daily-item weatherWidth" v-if="daily.length >= 8">
        <div class="labelWeather">生活指数</div>
        <ul>
          <li>
            <div class="daily-icon">
              <i class="iconfont icon-sports"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">{{daily[0].name}} {{daily[0].category}}</p>
               <p class="daily-box-text">{{daily[0].text}}</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-xiche-cuxiantiao"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">{{daily[1].name}} {{daily[1].category}}</p>
               <p class="daily-box-text">{{daily[1].text}}</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-clothes-full"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">{{daily[2].name}} {{daily[2].category}}</p>
               <p class="daily-box-text">{{daily[2].text}}</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-diaoyu"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">name</p>
               <p class="daily-box-text">text</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-fengjingjingdianlvyouxiaozhenfangziminsumianxing"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">name</p>
               <p class="daily-box-text">text</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-guominyuanjinghua"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">name</p>
               <p class="daily-box-text">text</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-ganmao"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">name</p>
               <p class="daily-box-text">text</p>
            </div>
          </li>
           <li>
            <div class="daily-icon">
              <i class="iconfont icon-fangshai"></i>
            </div>
            <div class="daily-box">
              <p class="daily-box-name">name</p>
               <p class="daily-box-text">text</p>
            </div>
          </li>
        </ul>
      </div>
      <!-- 每小时的数据  -->
      <div class=" weatherWidth">
        <div class="labelWeather">每小时预报</div>
        <!-- 柱状图表  -->
        <div ref="chart" style="width:100%;height:400px"></div>
      </div>
 </div>
</template>

<style scoped>

* {
    margin: 0;
    padding: 0;
}
html {
    overflow-x: hidden;
    font-size: 62.5%; 
    }
body, input, button, a, textarea, select {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
    font-size: 1.4rem;
    color: #333;
  }
  a,
  u,
  s {
    text-decoration: none;
    color: #333;
  }
  a:hover, a:focus {
    text-decoration: none;
  }
  a:hover {
    filter: alpha(opacity=90);
    opacity: .9;
  }
  ol, ul {
    list-style: none;
}
  input button select {
    outline: none;
  }
  fieldset, img, iframe {
    border: 0;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  i, em {
    font-style: normal;
  }
  
  label {
    font-weight: normal;
  }
  
  h2, h3, h4, p, dl, dt, dd {
    margin: 0;
    padding: 0;
  }
  img {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body, input, button, a, textarea, select, dl, ul, ol, li, h2, h3, h4, p, dl, dt, dd, span, div {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  
  /* css3过渡动画效果 */
  .trans {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
  }
  
  /* 文本对齐 */
  .fn-textcenter {
    text-align: center;
    }
    .fn-textright {
        text-align: right;
    }
    .fn-textleft {
        text-align: left;
    }

  /* 去掉浏览器focus默认外边框 */
  a:focus, button:focus, input:focus {
    outline: none;
  }
  
  /* 单行文字溢出省略号 */
  .ell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: keep-all;
    word-wrap: normal;
  }
  
  /* 清理浮动 */
  .fn-clear {
    zoom: 1;
    /* for IE6 IE7 */
  }
  .fn-clear:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
  }
 .container {
    color:#fff;
    background:linear-gradient(#245393,#1E4787)
}
.weatherWidth {
    width: 1200px;
    margin: auto;
}
.search {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 10px 0;
}
.search-item {
    display: flex;
    border-radius: 200px;
    background-color: #fff;
    width: 440px;
    height: 46px;
    justify-content: space-between;
    align-items: center;
}
.search-item input {
    flex: 1 1 0;
    margin:0 15px;
    line-height: 24px;
    border:0;
}
/* 搜索按钮 */
.search-item button {
    border:0;
    background:0;
    font-size: 20px;
    margin-right: 20px;
    cursor: pointer;
}
/* 今日天气 */
.weather {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 0;
}
.weather-left {
    flex:3;
    background-color:rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding:10px 20px;
}
.labelWeather {
    font-weight: 600;
    padding-bottom: 20px;
    line-height: 22px;
    white-space: nowrap;
}
.weather-summary {
    display: flex;
    gap:5px;
}
.weather-summary img {
    width: 80px;
    height: 80px;
}
.weather-temp {
    font-size: 60px;
    line-height: 62px;
    margin-left: 8px;
    display: flex;
    align-items: center;
}
.celsius {
    height: 100%;
    font-size: 34px;
}
.weather-describe {
    margin-left: 32px;
}
.weather-text {
    font-size: 18px;
    font-weight: 600;
    padding-top: 20px;
    line-height: 24px;
}
.wether-feelslike {
    height: 22px;
    padding-top: 5px;
}
.weather-item {
    margin: 10px 0;
}
.weather-item ul {
    display: flex;
    justify-content: space-between;
}
.weather-item ul li {
    text-align: center;
}
.item-title {
    font-size: 12px;
}
.item-details {
    font-size: 16px;
    font-weight: 600;
    padding-top: 5px;
}
/* 生活指数  */
.daily-item {
    background-color:rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding:10px 20px;
    margin-bottom: 20px;
}
.daily-item ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 20px 30px;
}
.daily-item ul li {
    flex: 0 1 48%;
    background-color:rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
}
.daily-icon {
    margin-right: 20px;
}
.daily-icon i {
    font-size: 26px;
    background-color: #22A6F5;
    border-radius: 50%;
    padding: 8px;
}
.daily-box-text {
    font-size: 12px;
    color:#c0c0c0;
}
.daily-box-name {
    font-weight: 600;
    margin-bottom: 8px;
}

/* 空气质量 */
.weather-right {
    flex:1;
    background-color:rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding:10px 20px;
}
/* 每小时的数据  */
.hourly {
    background-color:rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding:10px 20px;
    margin-bottom: 20px;
}
</style>
