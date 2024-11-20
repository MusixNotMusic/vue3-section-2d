<script>
import { ref, onMounted } from 'vue'

import { Section2D } from '@cdyw/vue3-section-2d'
import '@cdyw/vue3-section-2d/dist/style.css';


console.log('Section2D ==>', Section2D)

export default {
  name: 'App',
  components: { Section2D },
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
    <Section2D ref="sectionRef" theme="blue" :top="150" :left="100" :width="600" :height="400"></Section2D>
  </div>
</template>

<style scoped>
.section-2d {
  display: flex;
  position: relative;
}
</style>
