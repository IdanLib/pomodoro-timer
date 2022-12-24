const MIN_FACTOR = 59;
const SIXTY = 60;

class Timer {
    breakElement = document.querySelector("#break-length");
    sessionElement = document.querySelector("#session-length");
    countdownElement = document.querySelector("#time-left");
    labelElement = document.querySelector("#timer-label");
    timerID = undefined;
    modeObj = {
        isRunning: false,
        mode: "session",
        "session": [25, 0],
        "break": [5, 0],
        "-increment"(modeType) {
            this[modeType][0] = Math.min(60, this[modeType][0] + 1);
        },
        "-decrement"(modeType) {
            this[modeType][0] = Math.max(1, this[modeType][0] - 1);
        }
    }

    constructor(breakTime, sessionTime) {
        this.breakElement.innerHTML = breakTime.toString();
        this.sessionElement.innerHTML = sessionTime.toString();
        this.countdownElement.innerHTML = sessionTime + ":00";
        this.labelElement.innerHTML = "Work Time!";
        const resetBtn = document.querySelector("#reset");
        const startStopBtn = document.querySelector("#start_stop")
        const lenBtns = document.querySelectorAll(".len-button");

        resetBtn.addEventListener("click", () => { this.reset(25, 5, false, "session", true, "Work") });
        startStopBtn.addEventListener("click", () => { this.startStop() });

        lenBtns.forEach(lBtn => {
            const btnModeType = lBtn.id.match(/(^[a-z])\w+/g).join("");
            const btnDirection = lBtn.id.match(/(-)\w+/g).join("");
            const relevantElement = `${btnModeType}-length`;

            lBtn.addEventListener("click", () => {
                if (this.modeObj["isRunning"]) { return; }
                this.modeObj[btnDirection](btnModeType);
                this.modeObj[btnModeType][1] = 0;
                document.getElementById(`${relevantElement}`).innerText = this.modeObj[btnModeType][0];
                if (btnModeType == "session") {
                    this.#updateDisplay(this.modeObj[btnModeType][0], 0);
                }
            });
        });
    }

    reset(sessionTime, breakTime, isRun, whichSession, isByButton, labelPrefix) {
        this.modeObj["session"][0] = sessionTime;
        this.modeObj["session"][1] = 0;
        this.modeObj["break"][0] = breakTime;
        this.modeObj["break"][1] = 0;
        this.modeObj["isRunning"] = isRun;
        this.modeObj["mode"] = whichSession;
        this.sessionElement.innerHTML = sessionTime;
        this.breakElement.innerHTML = breakTime;
        this.#updateDisplay(this.modeObj[whichSession][0], 0);
        this.labelElement.innerHTML = `${labelPrefix} Time!`;
        if (isByButton) {
            clearTimeout(this.timerID);
            document.querySelector("#beep").pause();
            document.querySelector("#beep").currentTime = 0;
        }
    }

    startStop() {
        this.modeObj["isRunning"] = !this.modeObj["isRunning"];
        if (!this.modeObj["isRunning"]) {
            clearTimeout(this.timerID);
            return;
        }

        this.timerID = setInterval(() => {
            const currentMode = this.modeObj["mode"];
            let curMins = this.modeObj[currentMode][0];
            let curSecs = this.modeObj[currentMode][1];
            this.#calcTime(curMins, curSecs);
        }, 1000);
    }

    #calcTime(mins, secs) {
        secs = (secs - 1 + 60) % 60;
        mins = secs == 59 ? mins - 1 : mins;
        const currentMode = this.modeObj["mode"];
        this.modeObj[currentMode][1] = secs;
        this.modeObj[currentMode][0] = mins;
        this.#updateDisplay(mins, secs);
        if (this.countdownElement.innerText === "0-1:59") {
            document.querySelector("#beep").play();
            this.#resetPreparations();
        }
    }

    #resetPreparations() {
        const curSessionTime = parseInt(this.sessionElement.innerHTML);
        const curBreakTime = parseInt(this.breakElement.innerHTML);
        let labelPrefix = "";

        if (this.modeObj["mode"] == "session") {
            this.modeObj["mode"] = "break";
            labelPrefix = "Break"
        } else {
            this.modeObj["mode"] = "session";
            labelPrefix = "Work"
        }
        this.reset(curSessionTime, curBreakTime, true, this.modeObj["mode"], false, labelPrefix);
    }

    #updateDisplay(min, sec) {
        sec < 10 ? sec = "0" + sec.toString() : sec = sec.toString();
        min < 10 ? min = "0" + min.toString() : min = min.toString();
        this.countdownElement.innerHTML = `${min}:${sec}`;
    }
}

const timer = new Timer(5, 25);