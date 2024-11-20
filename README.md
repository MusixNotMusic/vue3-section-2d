# Section2D 二维切割

## 二维切割组件
1. 实现剖面切割功能
2. 截图功能
3. 鼠标取值显示功能
4. 海拔高度选择功能

## 参数
|参数|类型|描述|
|---|---|---|
|attentionPoints|props: \<Array\>|关注点|
|curTimeStamp|props: \<Number\>|当前时间，截图保存图片时间|
|theme|props: \<String\>|主题，用户自定义颜色，也可覆盖, blue和green|
|top|props: \<Number\>|绝对定位 top|
|right|props: \<Number\>|绝对定位 right|
|width|props: \<Number\>|视图宽度|
|height|props: \<Number\>|视图高度|
|close|emit: \<Function\>|订阅事件，关闭窗口|
|reset|emit: \<Function\>|订阅事件，重新选择|

## 主动调用方式

|主动调用函数|参数|描述|
|---|---|---|
|render|render(buffer, ups, coords, colorList)|buffer字节数据, ups数据, coords 用户选取的经纬度数据用于计算x轴距离，colorList 接口返回 0~255色卡|
|loadingData|loadingData(bool)|调用者主动控制渲染加载|

问: 为什么主动调用？  
答: 避免高度耦合vuex,axios 等其他组件

```js
import { ref, onMounted } from 'vue'
import Scetion2D from '../packages/src/Scetion2D.vue'

export default {
  name: 'App',
  components: { Scetion2D },
  setup() {
    const sectionRef = ref(null)
    // demo中有
    const colorList = [...] 
    
    const coords = [[104, 30], [104, 40]];
    const loadFile = () => {
      if (sectionRef.value) {
        // 主动调用 loading
        sectionRef.value.loadingData(true);
        fetch('/data/RCSPZ.zst').then(res => res.arrayBuffer()).then((buffer) => {
          console.log('buffer', buffer)
          
          setTimeout(() => {
            sectionRef.value.loadingData(false);
            // 主动渲染函数
            sectionRef.value.render(buffer, null, coords, colorList);
          }, 1000)
        })
      }
    }
    onMounted(() => {
      setTimeout(() => {
        loadFile(); 
      }, 100)
    })

    return {
      sectionRef
    }
  }
} 
```

## 组件依赖
还是使用了asd-2d asd-utils

1. 2d绘制放在asd-2d
2. 文件解析功能在asd-utils FileParser中
3. 图片截图也封装到asd-utils capture中

## source code
```js
<template>
    <Vue3DraggableResizable
        :theme="props.theme"
        class="cut-popup-window"
        ref="popupWindowRef"
        :initW="boxWidth"
        :initH="boxHeight"
        :minW="420"
        v-model:x="x"
        v-model:y="y"
        v-model:w="w"
        v-model:h="h"
        v-model:active="active"
        :draggable="true"
        :resizable="true"
        @resize-end="resizeEndHandle"
    >
        <div class="header">
            <span class="title">{{ title }}</span>
            <i
                class="icon-camera el-icon-camera-solid"
                @click="screenShotClick"
            >
                <!-- <HoverTitle title="下载" PositionType="absolute" /> -->
            </i>
            <i
                class="icon-close el-icon-close close"
                @click="closeView"
            ></i>
        </div>
        <!--      query-->
        <div class="query">
            <div class="group">
                <span class="name">剖面路径</span>
                <button class="button" @click="$emit('reset')">
                    重选
                </button>
            </div>

            <div class="group">
                <span class="name">产品选择</span>
                <el-select
                    size="mini"
                    v-model="production"
                    placeholder="请选择产品"
                    :popper-append-to-body="false"
                    style="width: 100px; border: none; border-radius: 2px"
                >
                    <el-option
                        v-for="item in productionList"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
            </div>

            <div class="group">
                <span class="name">高度</span>
                <el-select
                    size="mini"
                    v-model="altitude"
                    placeholder="请选择海拔高度"
                    :popper-append-to-body="false"
                    style="width: 80px; border: none; border-radius: 2px"
                    @change="altitudeChange"
                >
                    <el-option
                        v-for="item in altitudeList"
                        :key="item.value"
                        :label="item.name"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
            </div>
        </div>
        <!--    view area -->
        <div
            class="content"
            ref="contentRef"
            v-loading="loading"
            element-loading-background="rgba(255, 255, 255, 0.4)"
        >
            <div class="viewBox" ref="viewBoxRef">
                <canvas class="proCanvas" ref="canvasRef"></canvas>
                <div
                    class="tooltipRef"
                    ref="tooltipRef"
                    v-if="showTooltip"
                    v-html="showTooltip"
                ></div>
                <div
                    class="eventDiv"
                    @mousemove="drawTooltip($event)"
                ></div>
            </div>
            <div class="nodata-wrap" v-if="loading">
                <div class="nodata"></div>
                <div class="text">申请产品中</div>
            </div>
        </div>
    </Vue3DraggableResizable>
</template>

<script>
import {
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  ref,
  nextTick,
} from "vue";
import Vue3DraggableResizable from "vue3-draggable-resizable";
import * as turf from "@turf/turf";
import { decompress } from "@cdyw/asd-utils/compress/ZstdDecompress";
import { RCSPZFormat } from "@cdyw/asd-utils/FileParser/RCSPZ/RCSPZFormat";
import { screenshot } from "@cdyw/asd-utils/capture/picture";
import { Canvas2DProduct } from "@cdyw/asd-2d";
import dayjs from 'dayjs';

export default {
  name: "Scetion2D",
  components: {
    Vue3DraggableResizable,
  },
  emits: ["close", "reset"],
  props: {
    coords: {
      type: Array,
      default: () => [],
    },
    attentionPoints: {
      type: Array,
      default: () => [],
    },
    curTimeStamp: {
      type: [Number, String],
      default: Date.now()
    },
    theme: {
      default: 'blue'
    }
  },

  setup(props, { emit }) {
    const top = 70;
    const right = 80;
    const width = 550;
    const height = 380;
    

    let rcspzInstance;

    let state = reactive({
      title: "剖面产品",
      altitude: 20000,
      altitudeList: [
        { name: "5km", value: 5000 },
        { name: "10km", value: 10000 },
        { name: "15km", value: 15000 },
        { name: "20km", value: 20000 },
        // { name: "25km", value: 25000 },
      ],
      production: 0,
      productionList: [{ name: "反射率", value: 0 }],
      model: null,

      showTooltip: "",
      showWindow: true,
      loading: false,

      boxWidth: width,
      boxHeight: height,
      y: top,
      x: document.body.clientWidth - width - right,
      w: width,
      h: height,
      right: 0,
      active: false,
      elMsg: null
    });


    const popupWindowRef = ref(null);
    const contentRef = ref(null);
    const viewBoxRef = ref(null);
    const canvasRef = ref(null);
    const tooltipRef = ref(null);
    const clrView = ref(null);

    const closeView = () => {
      state.showWindow = false;
      emit("close");
    };

    const drawTooltip = (e) => {
      // console.log("drawTooltip");
      if (!viewBoxRef.value) return;
      if (rcspzInstance) {
        state.showTooltip = rcspzInstance.getTooltipHtml(
          e.offsetX,
          e.offsetY,
          "dBZ"
        );
      }
    };

    let colorCard = [];
    const render = (rawData, uparData, coords, colorCardList) => {
      decompress(rawData).then(decompress).then(bytes => RCSPZFormat.Parse(new Uint8Array(bytes))).then((rcspzData) => {
        console.log('rcspzData ==>', rcspzData);
        const line = turf.lineString(coords);
        const length = turf.length(line, { units: "kilometers" });

        // 计算一个比例
        const attention = [];
        if (props.attention) {
          const map = (val) => (coords[0][0] - val) / (coords[0][0] - coords[1][0])
          props.attentionPoints.forEach(point => {
            attention.push(map(point[0]));
          })
        }
        console.log('attention ==>', attention)

        colorCard = [];

        for (let index = 0; index < 256; index++) {
          const obj = colorCardList.find((item) => {
            return item.minIndex <= index && item.maxIndex >= index;
          });
          if (obj) {
            colorCard[index] = `rgb(${obj.color})`;
          }
        }

        console.log('colorCard ==>', colorCard)
       
        if (!rcspzInstance) {
          console.log(Canvas2DProduct);
          rcspzInstance = new Canvas2DProduct.RCSPZCanvas(
            {
              canvas: canvasRef.value,
              colorCard: colorCard,
              // realValue: realValueFunc,
              maxAltitude: state.altitude,
              maxLength: length,
              margin: { top: 20, bottom: 30, left: 30, right: 30}
            },
            rcspzData,
            uparData
          );
        }
        rcspzInstance.maxLength = length;
        rcspzInstance.rcspzData = rcspzData;
        rcspzInstance.rerender();
      })
    }

    const screenShotClick = (e) => {
      e.preventDefault();
      let title = state.title + '_' + dayjs(props.curTimeStamp).format('YYYY-MM-DD HH:mm:ss')
      screenshot(popupWindowRef.value.$el, title);
    };

    const resizeEndHandle = () => {
      if (rcspzInstance) {
        nextTick(() => {
          rcspzInstance.rerender();
        });
      }
    };

    const setRight = () => {
      if (state.x + state.w + right > document.body.clientWidth) {
        state.x = document.body.clientWidth - state.w - right;
      }
    };

    const altitudeChange = () => {
      if (rcspzInstance) {
        nextTick(() => {
          rcspzInstance.maxAltitude = state.altitude;
          rcspzInstance.rerender();
        });
      }
    };

    const loadingData = (loading) => {
      state.loading = loading;
    }

    onMounted(() => {
      setRight();
      window.addEventListener("resize", setRight);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", setRight);
    });
    const refData = toRefs(state);
    return {
      ...refData,
      props,
      closeView,
      screenShotClick,
      drawTooltip,
      popupWindowRef,
      contentRef,
      viewBoxRef,
      canvasRef,
      tooltipRef,
      clrView,
      resizeEndHandle,
      altitudeChange,
      render,
      loadingData
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../theme/blue.scss';
@import '../theme/green.scss';

.cut-popup-window {
    background: var(--theme-bg);
    box-shadow: var(--jelly-style-boxShadow);
    border: var(--jelly-style-light-border);
    border-radius: 4px 4px 4px 4px;
    padding-top: 8px;
    margin-bottom: 8px;

    .header {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        height: 28px;
        border-bottom: 1px solid #999999;

        .title {
            color: #fff;
            font-size: 14px;
            font-family: PingFang SC-Semibold, PingFang SC;
            font-weight: 600;
        }

        .icon-close {
            position: absolute;
            right: 12px;
            font-size: 16px;
            color: #fff;
            cursor: pointer;
        }

        .icon-camera {
            position: absolute;
            right: 36px;
            font-size: 16px;
            color: #fff;
            cursor: pointer;
        }
    }

    .query {
        display: flex;
        align-items: center;
        height: 46px;
        column-gap: 20px;
        padding: 0px 12px;

        //overflow: hidden;
        .group {
            display: flex;
            align-items: center;
            column-gap: 4px;

            .name {
                font-size: 14px;
                font-family: PingFang SC-Regular, PingFang SC;
                font-weight: 400;
                color: #ffffff;
            }

            .button {
                width: 48px;
                height: 28px;
                line-height: 22px;
                background: var(--theme-bg-deep);
                border-radius: 2px 2px 2px 2px;
                font-size: 14px;
                font-family: PingFang SC-Regular, PingFang SC;
                font-weight: 400;
                color: #ffffff;
                border: none;
                cursor: pointer;
                &:hover {
                  background: var(--buttn-live-active);
                }
            }
            
        }
    }
}

.content {
    width: 100%;
    height: calc(100% - 72px);
    position: relative;

    .contain-top {
        font-size: 40px;
        color: red;
        height: 40px;
        line-height: 35px;
        display: flex;
        align-items: center;

        .lableDiv {
            font-size: 14px;
            margin: 0 4px 0 9px;
            font-family: SimHei;
            font-weight: 400;
            color: #daf1ff;
        }

        :deep(input) {
            height: 24px;
            padding: 0 5px;
            background: #161e36;
            color: #daf1ff;
            border: 2px solid #434f65;
        }

        .heightDrop {
            width: 80px;
            margin-right: 18px;
        }

        .productDrop {
            width: 150px;
        }
    }

    .viewBox {
        width: 100%;
        height: 100%;
        //width: calc(100% - 70px);
        //height: calc(100% - 10px);
        position: relative;
        cursor: pointer;

        .proCanvas {
            position: absolute;
            z-index: 1;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
        }

        .coorCanvas {
            position: absolute;
            z-index: 0;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
        }

        .tooltipRef {
            z-index: 1002;
        }

        .eventDiv {
            position: absolute;
            z-index: 4;
            width: 100%;
            height: 100%;
        }
    }

    .content-col {
        position: absolute;
        right: 0px;
        top: 0px;
    }
}

.waitFlag,
.waitCutFlag {
    color: #ffffff;
    font-size: 24px;
    text-align: center;
    line-height: 200px;
}

.failClass {
    color: white;
    font-size: 20px;
    text-align: center;
    line-height: 200px;
}

.nodata-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;

    position: absolute;
    top: 0;
    z-index: 10;

    .nodata {
        width: 161px;
        height: 162px;
        background: url("../assets/img/cut-no-data.png");
        background-size: 100% 100%;
    }

    .text {
        font-size: 14px;
        font-family: PingFang SC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
    }
}
</style>

```

## demo
```js
<script setup>
<script>
import { ref, onMounted } from 'vue'
import Scetion2D from '../packages/src/Scetion2D.vue'

export default {
  name: 'App',
  components: { Scetion2D },
  setup() {
    const sectionRef = ref(null)
    const colorList = [
        {
            "val": -20,
            "minIndex": 0,
            "maxIndex": 26,
            "color": "0,0,3"
        },
        {
            "val": -5,
            "minIndex": 26,
            "maxIndex": 56,
            "color": "127,194,229"
        },
        {
            "val": 0,
            "minIndex": 56,
            "maxIndex": 66,
            "color": "0,174,165"
        },
        {
            "val": 5,
            "minIndex": 66,
            "maxIndex": 76,
            "color": "27,32,245"
        },
        {
            "val": 10,
            "minIndex": 76,
            "maxIndex": 86,
            "color": "64,162,245"
        },
        {
            "val": 15,
            "minIndex": 86,
            "maxIndex": 96,
            "color": "91,236,236"
        },
        {
            "val": 20,
            "minIndex": 96,
            "maxIndex": 106,
            "color": "95,253,16"
        },
        {
            "val": 25,
            "minIndex": 106,
            "maxIndex": 116,
            "color": "73,198,10"
        },
        {
            "val": 30,
            "minIndex": 116,
            "maxIndex": 126,
            "color": "50,143,5"
        },
        {
            "val": 35,
            "minIndex": 126,
            "maxIndex": 136,
            "color": "254,253,24"
        },
        {
            "val": 40,
            "minIndex": 136,
            "maxIndex": 146,
            "color": "226,191,18"
        },
        {
            "val": 45,
            "minIndex": 146,
            "maxIndex": 156,
            "color": "244,143,17"
        },
        {
            "val": 50,
            "minIndex": 156,
            "maxIndex": 166,
            "color": "240,10,13"
        },
        {
            "val": 55,
            "minIndex": 166,
            "maxIndex": 176,
            "color": "202,6,9"
        },
        {
            "val": 60,
            "minIndex": 176,
            "maxIndex": 186,
            "color": "181,5,7"
        },
        {
            "val": 65,
            "minIndex": 186,
            "maxIndex": 196,
            "color": "242,35,240"
        },
        {
            "val": 70,
            "minIndex": 196,
            "maxIndex": 206,
            "color": "114,14,132"
        },
        {
            "val": 95,
            "minIndex": 206,
            "maxIndex": 255,
            "color": "171,146,239"
        }
    ]
    
    const coords = [[104, 30], [104, 40]];
    const loadFile = () => {
      if (sectionRef.value) {
        sectionRef.value.loadingData(true);
        fetch('/data/RCSPZ.zst').then(res => res.arrayBuffer()).then((buffer) => {
          console.log('buffer', buffer)
          
          setTimeout(() => {
            sectionRef.value.loadingData(false);
            sectionRef.value.render(buffer, null, coords, colorList);
          }, 1000)
        })
      }
    }
    onMounted(() => {
      setTimeout(() => {
        loadFile(); 
      }, 100)
    })

    return {
      sectionRef
    }
  }
} 

</script>

<template>
 
  <div class="section-2d">
    <Scetion2D ref="sectionRef"></Scetion2D>
  </div>
</template>

<style scoped>
.section-2d {
  display: flex;
  position: relative;
}
</style>

```
