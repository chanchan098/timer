<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'

var timeParams: Ref<{ [key: string]: Number }> = ref({
    hoursStarted: 8,
    minutesStarted: 50,
    hoursNoonEnded: 12,
    minutesNoonEnded: 20,
    hoursPMRegistered: 13,
    minutesPMRegistered: 45,
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

var validRestOfPM = ref(0.0)

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

    var hoursStarted = timeParams.value.hoursStarted as unknown as number
    var minutesStarted = timeParams.value.minutesStarted as unknown as number
    var hoursNoonEnded = timeParams.value.hoursNoonEnded as unknown as number
    var minutesNoonEnded = timeParams.value.minutesNoonEnded as unknown as number


    var hoursPMRegistered = timeParams.value.hoursPMRegistered as unknown as number
    var minutesPMRegistered = timeParams.value.minutesPMRegistered as unknown as number
    var hoursEnded = timeParams.value.hoursEnded as unknown as number
    var minutesEnded = timeParams.value.minutesEnded as unknown as number


    var overedSeconds: number = 0
    if (minutesStarted != 0) {
        overedSeconds = (minutesStarted * 60)
    }

    var allSeconds = ((hoursEnded - hoursStarted) * 60 * 60) - (overedSeconds) + (minutesEnded * 60)
    var allSecondsOfNoon = ((hoursNoonEnded - hoursStarted) * 60 * 60) - (overedSeconds) + (minutesNoonEnded * 60)

    duration.value = (allSeconds / 60 / 60).toFixed(2) as unknown as number
    durationNoon.value = (allSecondsOfNoon / 60 / 60).toFixed(2) as unknown as number


    var overedSecondsPM: number = 0
    if (minutesPMRegistered != 0) {
        overedSecondsPM = (minutesPMRegistered * 60)
    }

    var hoursPM = hoursEnded - hoursPMRegistered
    var allSecondsPM = (hoursPM * 60 * 60) + (minutesEnded * 60) - (overedSecondsPM as unknown as number)

    validRestOfPM.value = (allSecondsPM / 60 / 60).toFixed(2) as unknown as number
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
    var minutesEnded = timeParams.value.minutesEndedf
    // var hoursNoonEnded = timeParams.value.hoursNoonEnded
    // var minutesNoonEnded = timeParams.value.minutesNoonEnded

    var overedSeconds: Number = 0
    if (minutesStarted != 0) {
        overedSeconds = (minutesStarted * 60)
    }

    var allSeconds = ((hoursEnded - hoursStarted) * 60 * 60) - (overedSeconds) + (minutesEnded * 60)
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


                        <el-row class="!mb-5px">
                            <el-col :span="17">
                                <div class="text-right">valid AM hours: </div>
                            </el-col>
                            <el-col :span="7">
                                <div class="text-left ml-5px">{{ durationNoon }} h</div>
                            </el-col>
                        </el-row>

                        <el-row class="!mb-5px">
                            <el-col :span="17">
                                <div class="text-right">valid PM hours: </div>
                            </el-col>
                            <el-col :span="7">
                                <div class="text-left ml-5px">{{ validRestOfPM }} h</div>
                            </el-col>
                        </el-row>

                        <el-col v-for="(value, key, index) in timeParams">
                            <el-divider v-if="index == 4"></el-divider>
                            <el-row class="!mb-5px">
                                <el-col :span="17">
                                    <div class="text-right">{{ key }}: </div>
                                </el-col>
                                <el-col :span="7">
                                    <div class="text-left ml-5px">{{ value }}</div>
                                </el-col>
                            </el-row>

                        </el-col>
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
