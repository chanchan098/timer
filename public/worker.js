self.onmessage = function (event) {
    if (event.data.action === 'start') {
        var handle
        var dt = event.data.data
        console.log("data", dt)
        var hoursStarted = dt.hoursStarted
        var minutesStarted = dt.minutesStarted
        var hoursEnded = dt.hoursEnded
        var minutesEnded = dt.minutesEnded
        var hoursNoonEnded = dt.hoursNoonEnded
        var minutesNoonEnded = dt.minutesNoonEnded

        var overed = 0
        if (minutesStarted != 0) {
            overed = (minutesStarted * 60)
        }

        var allSeconds = ((hoursEnded - hoursStarted) * 60 * 60) - (overed) + (minutesEnded * 60)
        var allSecondsOfNoon = ((hoursNoonEnded - hoursStarted) * 60 * 60) - (overed) + (minutesNoonEnded * 60)

        var hoursGone = new Date().getHours() - hoursStarted
        var minutesGone = new Date().getMinutes()

        var secondsGone = (hoursGone * 60 * 60) -
            (minutesStarted * 60) +
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









function test(hoursStarted, minutesStarted, hoursEnded, minutesEnded) {
    var hoursStarted = hoursStarted
    var minutesStarted = minutesStarted
    var hoursEnded = hoursEnded
    var minutesEnded = minutesEnded

    var overed = 0
    if (minutesStarted != 0) {
        overed = (minutesStarted * 60)
    }

    var allSeconds = ((hoursEnded - hoursStarted) * 60 * 60) - (overed) + (minutesEnded * 60)


    var hoursGone = new Date().getHours() - hoursStarted
    var minutesGone = new Date().getMinutes()

    var secondsGone = (hoursGone * 60 * 60) -
        (minutesStarted * 60) +
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