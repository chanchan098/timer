<script setup lang="ts">
import { ref, onMounted, Ref, computed } from 'vue'

var timeParams: Ref<{ [key: string]: number }> = ref({
    H_Started: 8,
    M_Started: 50,
    H_NoonEnded: 12,
    M_NoonEnded: 20,
    H_PMStarted: 13,
    M_PMStarted: 45,
    H_Ended: 18,
    M_Ended: 20,
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
var validRestOfAM = ref(0)
// var durationAfternoon = ref(0)

const ALL = computed(() => { return (validRestOfAM.value + validRestOfPM.value).toFixed(3) })


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

    var H_Started = timeParams.value.H_Started as unknown as number
    var M_Started = timeParams.value.M_Started as unknown as number
    var H_NoonEnded = timeParams.value.H_NoonEnded as unknown as number
    var M_NoonEnded = timeParams.value.M_NoonEnded as unknown as number


    var H_PMStarted = timeParams.value.H_PMStarted as unknown as number
    var M_PMStarted = timeParams.value.M_PMStarted as unknown as number
    var H_Ended = timeParams.value.H_Ended as unknown as number
    var M_Ended = timeParams.value.M_Ended as unknown as number


    var overedSeconds: number = 0
    if (M_Started != 0) {
        overedSeconds = (M_Started * 60)
    }

    var allSeconds = ((H_Ended - H_Started) * 60 * 60) - (overedSeconds) + (M_Ended * 60)
    var allSecondsOfNoon = ((H_NoonEnded - H_Started) * 60 * 60) - (overedSeconds) + (M_NoonEnded * 60)

    duration.value = (allSeconds / 60 / 60)
    validRestOfAM.value = (allSecondsOfNoon / 60 / 60)


    var overedSecondsPM: number = 0
    if (M_PMStarted != 0) {
        overedSecondsPM = (M_PMStarted * 60)
    }

    var hoursPM = H_Ended - H_PMStarted
    var allSecondsPM = (hoursPM * 60 * 60) + (M_Ended * 60) - (overedSecondsPM as unknown as number)

    validRestOfPM.value = (allSecondsPM / 60 / 60)
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
    const sEveryDay = 200
    var H_Started = timeParams.value.H_Started
    var M_Started = timeParams.value.M_Started
    var H_Ended = timeParams.value.H_Ended
    var M_Ended = timeParams.value.M_Ended
    // var H_NoonEnded = timeParams.value.H_NoonEnded
    // var M_NoonEnded = timeParams.value.M_NoonEnded

    var overedSeconds: number = 0
    if (M_Started != 0) {
        overedSeconds = (M_Started * 60)
    }

    var allSeconds = ((H_Ended - H_Started) * 60 * 60) - (overedSeconds) + (M_Ended * 60)

    var perSecond = (sEveryDay / allSeconds)
    var perMinutes = (sEveryDay / (allSeconds / 60))
    var perHour = (sEveryDay / (allSeconds / 60 / 60))
    var all = {
        perSecond: perSecond.toFixed(3),
        perMinutes: perMinutes.toFixed(3),
        perHour: perHour.toFixed(3),
    }
    console.log("salary", all)
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
                        <template #header>Morning to noon <span class="text-12px">({{ validRestOfAM }}h)
                                ({{ duration - validRestOfAM }}h)</span></template>

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
                                <div class="text-left ml-5px">{{ validRestOfAM.toFixed(3) }} h</div>
                            </el-col>
                        </el-row>

                        <el-row class="!mb-5px">
                            <el-col :span="17">
                                <div class="text-right">valid PM hours: </div>
                            </el-col>
                            <el-col :span="7">
                                <div class="text-left ml-5px">{{ validRestOfPM.toFixed(3) }} h</div>
                            </el-col>
                        </el-row>

                        <el-row class="!mb-5px">
                            <el-col :span="17">
                                <div class="text-right">ALL: </div>
                            </el-col>
                            <el-col :span="7">
                                <div class="text-left ml-5px">{{ ALL }} h</div>
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
                        <template #header>Morning to noon <span class="text-12px">({{ validRestOfAM.toFixed(2) }}h)({{
                                (duration -
                                validRestOfAM).toFixed(2) }}h)</span></template>

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
