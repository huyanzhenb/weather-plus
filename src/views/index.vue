<script setup>
import * as echarts from 'echarts'
import { onMounted,ref } from 'vue';
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import axios from 'axios'

const chart =ref()
const chart1 =ref()
let city = ref('北京')
let city2 = ref('北京')
let weather =ref({})
let location = ref()
let zhishu = ref([])
let hour = ref()
let air =ref()

const search = async()=>{
 city2.value = city.value;

 let loc = await axios.get('https://geoapi.qweather.com/v2/city/lookup',{
    params:{
     location:`${city.value}`,
     key:'7a69e52076a74e23b48c50fad80ce32c'
    }
})
 location.value =loc.data.location[0].id
 let res = await axios.get('https://devapi.qweather.com/v7/weather/now',{
    params:{
     location:location.value,
     key:'7a69e52076a74e23b48c50fad80ce32c'
    }
})
weather.value=res.data.now
let qwq = await axios.get('https://devapi.qweather.com/v7/indices/1d',{
    params:{
     location:location.value,
     key:'7a69e52076a74e23b48c50fad80ce32c',
     type:'3,5'
    }
})
zhishu.value= qwq.data.daily


let time = await axios.get('https://devapi.qweather.com/v7/weather/24h',{
    params:{
     location:location.value,
     key:'7a69e52076a74e23b48c50fad80ce32c',
    }
})
hour.value = time.data.hourly.slice(0,10)
console.log(hour.value)

let res4 = await axios.get('https://devapi.qweather.com/v7/air/now',{
    params:{
     location:location.value,
     key:'7a69e52076a74e23b48c50fad80ce32c',
    }
})
air.value =res4.data.now
console.log(air.value)

chartInit()
chartInit1()

}

const chartType = ref('bar');
const exchange=()=> {   
chartType.value = chartType.value === 'line' ? 'bar' : 'line';  
console.log(chartType.value)
chartInit()
} 
onMounted(()=>{
    search()
})
//柱状图
function chartInit(){
    let myChart =echarts.init(chart.value)
    let option = {
        tooltip:{},
  xAxis: {
    type: 'category',
    data: hour.value.map(item=>item.fxTime.substring(11,16)),
    // axisLine:{
    //     linestyle:{
    //         color:'#fff'
    //     }
    // }
  },
  yAxis: {
    type: 'value',
    axilLine:{
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
    { name:'气温',
      data: hour.value.map(item=>item.temp),
      type: chartType.value,
      itemStyle:{
        color:'#1264cf',
      },
      barWidth:'30%',
      label:{
        position:'top',
      }
    }
  ]
};
myChart.setOption(option);
}
//空气质量
function chartInit1(){
    let myChart =echarts.init(chart1.value)
    let option={
        series:[
            {
                type:'gauge',
                max:200,
                title:{
                    color:'red',
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
                detail:{
                    fontSize:30,
                    offsetCenter:[0,'60%'],
                    formatter:'{value}'
                }
            }
        ]
    }
    myChart.setOption(option)
}
</script>

<template>
<div class="container">
    <div class="search">
        <div class="search-item">
            <el-input v-model="city" style="width: 240px" placeholder="请输入天气" />
            <el-button type="primary" :icon="Search" @click="search"></el-button>
        </div>
    </div>
    
    <div class="weather">
         <div class="weather-left">
            <div class="me" style="margin-left: 40px;display: flex;">{{ city2 }}天气：</div>
            <div class="weather-summary">
                <p style="font-size: 35px;margin-left: -50px;">{{ weather.temp }}<span>度</span></p>
                <div class="weather-describe" style="margin-left: 50px;">
                    <div class="weather-text">{{ weather.text }}</div>
                    <div style="margin-top: 20px;" class=" weather-feelslike">体感温度：{{ weather.feelsLike }}度</div>
                </div>
            </div>
            <ul class="weather-item"  style="margin: 0 80px 0 80px;">
                <li>
                    <div style="margin-left: 3px;">风向</div>
                    <div class="mf">{{ weather.windDir }}</div>
                </li>
                <li>
                    <div style="margin-left: -20px;">风力等级</div>
                    <div class="mf">{{ weather.windScale }}</div>
                </li>
                <li>
                    <div style="margin-left: -20px;">相对湿度</div>
                    <div class="mf">{{ weather.humidity }}</div>
                </li>
                <li>
                    <div style="margin-left: -10px;">大气压强</div>
                    <div class="mf">{{ weather.pressure}}</div>
                </li>
                <li>
                    <div style="margin-left: 10px;">能见度</div>
                    <div class="mf">{{ weather.vis }}公里</div>
                </li>
                <li>
                    <div  style="margin-left: -10px;background-image: url(../assets/images/icons/);">云量</div>
                    <div class="mf">{{ weather.cloud }}</div>
                </li>
            </ul>
            <div class="zhishu">
            <p style="margin: -10px 20px 0 20px;line-height: 150%;color: #1264cf;font-weight: 600;" v-if="zhishu.length>=2">{{ zhishu[0].text ||'' }},{{ zhishu[1].text ||'' }}</p>
            </div>
         </div>
         <div class="weather-right " style="margin-left: 10px;">
            <div class="me" style='margin-left: 20px;margin-top: 20px;'>空气质量</div>
            <div style="width: 100%;height: 280px;text-align: center;">
                <div ref="chart1" style="width: 100%;height: 100%;">
                </div>
            </div>
        </div>
    </div>
    <div class="hour-weather">
        <div class="me mg" >每小时预报</div>
        <button  style="margin-left: 60px;margin-top:55px;height: 40px;width: 80px;border-radius: 20%;border: none;background-color:#377de0;color:aliceblue;font-size: 15px;" @click="exchange">切换</button>
        <div ref="chart" style="width: 100%;height: 400px;margin-left: 10px;"></div>
    </div>
</div>
</template>

<style scoped lang="less">
.container{
    background: linear-gradient(#5e8ed1,#3371d4);
    height: 100vh;
    width: 100%;
}
.search{
    display: flex;
    width: 100%;
    background-color: rgba(255, 255, 255,0.1);
    justify-content: center;
    height: 80px;
    border-bottom-right-radius: 20px;  
    border-bottom-left-radius: 20px;

}
.search-item{
    display: flex;
    align-items: center;
    background-color: white;
    width: 400px;
    justify-content: space-around;
    border-radius: 20px;
    margin: 10px;}
.weather{
    display: flex;
    margin: 20px auto;
    height: 300px;
    width: 95vw;
    justify-content: space-between;
}
.weather-left{
    background-color: rgba(255, 255, 255,0.1);
    height: 300px;
    width: 70%;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 20px 0;
}
.weather-right{
    background-color: rgba(255, 255, 255,0.1);
    height: 300px;
    width: 400px;
    border-radius: 20px;
}
.weather-item{
    display: flex;
    justify-content: space-between;
    margin: 0 10px;
}
.weather-summary{
    display: flex;
    justify-content: space-around;
    width: 700px;
}
.zhishu{
    height: 40px;
}
.hour-weather{
    background-color: rgba(255, 255, 255,0.1);
    width: 95vw;
    margin: 0 auto;
    border-radius: 20px;
    position: relative;
    height: 500px;
}
.mg{
 position: absolute;
 left: 45vw;
 top: 20px;
}
div{
    font-size: 20px;
    font-weight: 600;
    color: #bacfd8;
}
.me{
    color: #1264cf;
    font-weight: 700;
    font-size: 30px;
}
.mf{
    color: #1264cf;
    font-weight: 700;
    font-size: 25px;
    margin-top: 10px;
}

</style>