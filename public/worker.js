self.onmessage = function (event) {
    if (event.data.action === 'start') {
        var handle
        var dt = event.data.data
        console.log("data", dt)
        var H_Started = dt.H_Started
        var M_Started = dt.M_Started
        var H_Ended = dt.H_Ended
        var M_Ended = dt.M_Ended
        var H_NoonEnded = dt.H_NoonEnded
        var M_NoonEnded = dt.M_NoonEnded

        var overed = 0
        if (M_Started != 0) {
            overed = (M_Started * 60)
        }

        var allSeconds = ((H_Ended - H_Started) * 60 * 60) - (overed) + (M_Ended * 60)
        var allSecondsOfNoon = ((H_NoonEnded - H_Started) * 60 * 60) - (overed) + (M_NoonEnded * 60)

        var hoursGone = new Date().getHours() - H_Started
        var minutesGone = new Date().getMinutes()

        var secondsGone = (hoursGone * 60 * 60) -
            (M_Started * 60) +
            (minutesGone * 60) +
            new Date().getSeconds()

        var seconds = allSeconds - secondsGone
        var seconds_ = allSecondsOfNoon - secondsGone


        handle = setInterval(() => {
            seconds -= 1
            var minutes = (seconds / 60).toFixed(2)
            var hours = (minutes / 60).toFixed(2)

            var minutes_ = 0
            var hours_ = 0
            var restsOfNoon
            if (seconds_ > 0) {
                seconds_ -= 1
                minutes_ = (seconds_ / 60).toFixed(2)
                hours_ = (minutes_ / 60).toFixed(2)
                restsOfNoon = {
                    "seconds_": seconds_,
                    "minutes_": minutes_,
                    "hours_": hours_
                }
            }
            var rests = {
                "seconds": seconds,
                "minutes": minutes,
                "hours": hours,
            }
            self.postMessage({ "action": "updateDOM", "rests": rests, "restsOfNoon": restsOfNoon })
            // console.log("rest seconds: ", seconds, "rest minutes: ", minutes, "rest hours: ", hours)
            if (seconds <= 0) {
                clearInterval(handle)
                self.postMessage({ "action": "Done" })
            }
        }, 1000)
    }
};









function test(H_Started, M_Started, H_Ended, M_Ended) {
    var H_Started = H_Started
    var M_Started = M_Started
    var H_Ended = H_Ended
    var M_Ended = M_Ended

    var overed = 0
    if (M_Started != 0) {
        overed = (M_Started * 60)
    }

    var allSeconds = ((H_Ended - H_Started) * 60 * 60) - (overed) + (M_Ended * 60)


    var hoursGone = new Date().getHours() - H_Started
    var minutesGone = new Date().getMinutes()

    var secondsGone = (hoursGone * 60 * 60) -
        (M_Started * 60) +
        (minutesGone * 60) +
        new Date().getSeconds()

    var seconds = allSeconds - secondsGone

    console.log("allSeconds", allSeconds)
    console.log("hoursGone", hoursGone)
    console.log("minutesGone", minutesGone)
    console.log("secondsGone", secondsGone)
    console.log("seconds", seconds)
}


// test(8,50,18,10)