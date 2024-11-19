<template>
    <div></div>
</template>

<script lang="ts">
import {
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  ref,
  nextTick,
} from "vue";


export default {
  name: "demo",
  components: {
  },
 

  setup(props, { emit }) {
    

    onMounted(() => {
    });

    onUnmounted(() => {
    });
    return {
    };
  },
};
</script>

<style lang="scss" scoped>
@use '../theme/blue.scss';
@use '../theme/green.scss';

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
