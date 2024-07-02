<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'

var timeParams: Ref<{ [key: string]: Number }> = ref({
    hoursStarted: 8,
    minutesStarted: 50,
    hoursNoonEnded: 12,
    minutesNoonEnded: 20,
    hoursEnded: 18,
    minutesEnded: 20,
})

var rests = ref({
    seconds: 0,
    minutes: 0,
    hours: 0,
})

var restsOfNoon = ref({
    seconds_: 0,
    minutes_: 0,
    hours_: 0
})

var paramStr = ""

var font = { fontSize: 18, color: 'rgba(0, 0, 0, .15)' }

var waterMarker = ref(['Waiting'])
var isLoading = ref(true)
var isMobile = ref(false)
// var show = ref("")
var duration = ref(0)
var durationNoon = ref(0)
// var durationAfternoon = ref(0)


function initData() {

    const searchParams = new URLSearchParams(window.location.search);

    for (var k in timeParams.value) {
        if (searchParams.get(k)) {
            timeParams.value[k] = Number(searchParams.get(k))
            if (paramStr == "") {
                paramStr = `?${k}=${timeParams.value[k]}`
            } else {
                paramStr = paramStr + `&${k}=${timeParams.value[k]}`
            }
        }
    }

    var hoursStarted = timeParams.value.hoursStarted
    var minutesStarted = timeParams.value.minutesStarted
    var hoursEnded = timeParams.value.hoursEnded
    var minutesEnded = timeParams.value.minutesEnded
    var hoursNoonEnded = timeParams.value.hoursNoonEnded
    var minutesNoonEnded = timeParams.value.minutesNoonEnded

    var overed: Number = 0
    if (minutesStarted != 0) {
        overed = (minutesStarted.valueOf() * 60)
    }

    var allSeconds = ((hoursEnded.valueOf() - hoursStarted.valueOf()) * 60 * 60) - (overed.valueOf()) + (minutesEnded.valueOf() * 60)
    var allSecondsOfNoon = ((hoursNoonEnded.valueOf() - hoursStarted.valueOf()) * 60 * 60) - (overed.valueOf()) + (minutesNoonEnded.valueOf() * 60)
    duration.value = (allSeconds / 60 / 60).toFixed(2) as unknown as number
    durationNoon.value = (allSecondsOfNoon / 60 / 60).toFixed(2) as unknown as number
}

function initWorker() {
    const worker = new Worker('worker.js');
    worker.onmessage = function (event) {
        const d = event.data
        if (d.action === 'updateDOM') {

            const dRests = d.rests
            const dRestsOfNoon = d.restsOfNoon

            if (dRestsOfNoon) {
                restsOfNoon.value = dRestsOfNoon
            }

            if (dRests) {
                rests.value = dRests
            }

        }
        if (d.action === 'Done') {
            waterMarker.value = ['Done']
        }
    }


    var timeParamsObj = JSON.parse(JSON.stringify(timeParams.value))

    worker.postMessage({ action: 'start', data: timeParamsObj });
    setTimeout(() => {
        isLoading.value = false
    }, 1000)
}

function checkScreenWidthAndRedirect() {
    var mobileWidthThreshold = 768;

    if (window.innerWidth <= mobileWidthThreshold) {
        isMobile.value = true
    } else {
        isMobile.value = false
    }
}

function calculateSalary() {
    var hoursStarted = timeParams.value.hoursStarted
    var minutesStarted = timeParams.value.minutesStarted
    var hoursEnded = timeParams.value.hoursEnded
    var minutesEnded = timeParams.value.minutesEnded
    // var hoursNoonEnded = timeParams.value.hoursNoonEnded
    // var minutesNoonEnded = timeParams.value.minutesNoonEnded

    var overed: Number = 0
    if (minutesStarted != 0) {
        overed = (minutesStarted.valueOf() * 60)
    }

    var allSeconds = ((hoursEnded.valueOf() - hoursStarted.valueOf()) * 60 * 60) - (overed.valueOf()) + (minutesEnded.valueOf() * 60)
    const sEveryDay = 200
    var perSecond = (sEveryDay / allSeconds).toFixed(2)
    var perMinutes = (sEveryDay / (allSeconds / 60)).toFixed(2)
    var perHour = (sEveryDay / (allSeconds / 60 / 60)).toFixed(2)

    console.log(
        {
            perSecond: perSecond,
            perMinutes: perMinutes,
            perHour: perHour,
        }

    )
}

onMounted(() => {
    checkScreenWidthAndRedirect()
    initData()
    initWorker()
    calculateSalary()
    window.addEventListener('resize', checkScreenWidthAndRedirect);
    setTimeout(() => {
        isLoading.value = false
    }, 2000)
})

</script>

<template>

    <el-watermark :font="font" :content="waterMarker" class="h-[100%] w-[100%]">
        <div v-if="isMobile" class="w-[100%] relative left-0 top-5%" v-loading="isLoading">
            <el-row>
                <el-col :span="20" :offset="2">
                    <el-card>
                        <template #header>Morning to afternoon <span class="text-12px">({{ duration
                                }}h)</span></template>

                        <el-row v-for="(value, key) in rests">
                            <el-col :span="12">
                                <div class="text-right">{{ key }}: </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="text-left ml-5px">{{ value }}</div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="20" :offset="2">
                    <el-card>
                        <template #header>Morning to noon <span class="text-12px">({{ durationNoon }}h)
                                ({{ duration - durationNoon }}h)</span></template>

                        <el-row v-for="(value, key) in restsOfNoon">
                            <el-col :span="12">
                                <div class="text-right">{{ key.replace("_", "") }}: </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="text-left ml-5px">{{ value }}</div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="12" :offset="10">
                    <el-card class="text-12px">

                        <el-row v-for="(value, key) in timeParams" class="!mb-5px">
                            <el-col :span="18">
                                <div class="text-right">{{ key }}: </div>
                            </el-col>
                            <el-col :span="4">
                                <div class="text-left ml-5px">{{ value }}</div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <div v-else class="w-[100%] relative left-0 top-15%" v-loading="isLoading">
            <el-row>
                <el-col :span="6" :offset="9">
                    <el-card>
                        <template #header>Morning to afternoon <span class="text-12px">({{ duration
                                }}h)</span></template>

                        <el-row v-for="(value, key) in rests">
                            <el-col :span="12">
                                <div class="text-right">{{ key }}: </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="text-left ml-5px">{{ value }}</div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="5" :offset="0">
                    <el-card class="text-12px">

                        <el-row v-for="(value, key) in timeParams   " class="!mb-5px">
                            <el-col :span="17">
                                <div class="text-right">{{ key }}: </div>
                            </el-col>
                            <el-col :span="7">
                                <div class="text-left ml-5px">{{ value }}</div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
                <el-col :span="6" :offset="4">
                    <el-card>
                        <template #header>Morning to noon <span class="text-12px">({{ durationNoon }}h)({{ duration -
        durationNoon }}h)</span></template>

                        <el-row v-for="(value, key) in restsOfNoon">
                            <el-col :span="12">
                                <div class="text-right">{{ key.replace("_", "") }}: </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="text-left ml-5px">{{ value }}</div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>

            </el-row>
        </div>
    </el-watermark>

</template>

<style>
.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    text-align: center;
    border-radius: 4px;
}
</style>
