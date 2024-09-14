import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Audio } from "expo-av"
import type { TimerInfo } from "../types/Timer"


export type PomodoroProps = {
    setScreenPomodoro: Function
    setScreenConfig: Function
}

const defaultInfo: TimerInfo = { SHORT_INTERVAL: 5, LONG_INTERVAL: 15, WORKING_TIME: 25, CYCLE: 4 }


export default function Pomodoro({ setScreenPomodoro, setScreenConfig }: PomodoroProps) {

    const [sound, setSound] = useState<Audio.Sound | undefined>(undefined)
    const [working, setWorking] = useState("00:00")
    const [shortPause, setShortPause] = useState("00:00")
    const [longPause, setLongPause] = useState("00:00")
    const [currentPhase, setCurrentPhase] = useState("START POMODORO")
    const [timerRunning, setTimerRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [remainingSeconds, setRemainingSeconds] = useState(0)
    const [intervalId, setIntervalId] = useState<number | undefined>(undefined)
    const [cycleCount, setCycleCount] = useState(0)
    const [info, setInfo] = useState<TimerInfo>(defaultInfo)


    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userInfo = await AsyncStorage.getItem("timerInfo")
                if (userInfo) {
                    setInfo(JSON.parse(userInfo))

                } else {
                    console.log("No user info found")
                }
            } catch (error) {
                console.log(error)
            }
        }
    
        getUserInfo()
    }, []) 
    
    useEffect(() => {
        setWorking(formatTime(info.WORKING_TIME * 60))
        setShortPause(formatTime(info.SHORT_INTERVAL * 60))
        setLongPause(formatTime(info.LONG_INTERVAL * 60))

    }, [info]) 

    
    const soundMap: { [key: string]: any } = {
        work: require("../assets/sound/work.mp3"),
        short: require("../assets/sound/short.mp3"),
        long: require("../assets/sound/long.mp3"),
    };

    const playSound = async (soundName: string) => {
        const soundFile = soundMap[soundName];
        if (!soundFile) {
            console.log(`Sound ${soundName} not found!`);
            return;
        }
      
        const { sound } = await Audio.Sound.createAsync(soundFile);
        setSound(sound);
        await sound.playAsync();
    };  

    useEffect(() => {
        return sound
        ? () => {
            sound.unloadAsync();
          }
        : undefined;
    }, [sound])


    const formatTime = (totalSeconds: number) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
        const seconds = String(totalSeconds % 60).padStart(2, "0")
        return `${minutes}:${seconds}`
    }

    const handleStartTimer = () => {
        if (!timerRunning && !isPaused) {
            setCurrentPhase("WORKING")
            playSound("work")
            setRemainingSeconds(info.WORKING_TIME * 60)
            setTimerRunning(true)
        }
        setIsPaused(false)
    }

    const handlePauseTimer = () => {
        setIsPaused(true)
    }

    const handleStopTimer = () => {
        clearInterval(intervalId)
        setTimerRunning(false)
        setIsPaused(false)
        setCycleCount(0)
        setRemainingSeconds(0)
        setWorking(formatTime(info.WORKING_TIME * 60))
        setShortPause(formatTime(info.SHORT_INTERVAL * 60))
        setLongPause(formatTime(info.LONG_INTERVAL * 60))
        setCurrentPhase("START POMODORO")
    }

    const handleConfigScreen = () => {
        setScreenPomodoro(false)
        setScreenConfig(true)
    }


    useEffect(() => {
        if (timerRunning && !isPaused) {
            const id = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 0) {
                        clearInterval(id)
                        if (currentPhase === "WORKING") {
                            if (cycleCount < info.CYCLE - 1) {
                                setCurrentPhase("SHORT PAUSE")
                                playSound("short")
                                setRemainingSeconds(info.SHORT_INTERVAL * 60)
                                setCycleCount(cycleCount + 1)
                            } else {
                                setCurrentPhase("LONG PAUSE")
                                playSound("long")
                                setRemainingSeconds(info.LONG_INTERVAL * 60)
                                setCycleCount(0)
                            }
                        } else {
                            setCurrentPhase("WORKING")
                            playSound("work")
                            setRemainingSeconds(info.WORKING_TIME * 60)
                        }
                        return remainingSeconds
                    }
                    return prev - 1
                })
            }, 1000)

            setIntervalId((id as any))
            return () => clearInterval(id)

        } else if (isPaused) {
            clearInterval(intervalId)
        }

    }, [timerRunning, isPaused, currentPhase])

    useEffect(() => {
        if (currentPhase === "WORKING") setWorking(formatTime(remainingSeconds))
        else if (currentPhase === "SHORT PAUSE") setShortPause(formatTime(remainingSeconds))
        else if (currentPhase === "LONG PAUSE") setLongPause(formatTime(remainingSeconds))
    }, [remainingSeconds, currentPhase])

    return (
        <View style={styles.container}>

            <View style={styles.pomodoroBox}>
                <View style={styles.pomodoroNameBox}>
                    <Text style={styles.pomodoroTextTitle}>POMODORO</Text>
                </View>

                <View style={styles.pomodoroButtonsBox}>
                    <View style={styles.pomodoroActionsButtonsBox}>
                        <TouchableOpacity onPress={handleStartTimer} style={[styles.pomodoroActionsButton, styles.pomodoroActionStart]}>
                            <Text style={styles.pomodoroTextButtons}>START</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handlePauseTimer} style={[styles.pomodoroActionsButton, styles.pomodoroActionPause]}>
                            <Text style={styles.pomodoroTextButtons}>PAUSE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleStopTimer} style={[styles.pomodoroActionsButton, styles.pomodoroActionStop]}>
                            <Text style={styles.pomodoroTextButtons}>STOP</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleConfigScreen} style={styles.pomodoroConfigButton}>
                        <Text style={styles.pomodoroTextButtons}>CONFIGURATIONS</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.timerBox}>
                <View style={styles.timerWorkingBox}>
                    <Text style={styles.timerTextWorking}>{working}</Text>
                </View>

                <View style={styles.timerShortAndLongBox}>
                    <View>
                        <Text style={styles.timerTextShort}>{shortPause}</Text>
                    </View>

                    <View>
                        <Text style={styles.timerTextLong}>{longPause}</Text>
                    </View>
                </View>

                <View style={styles.timerCurrentPhaseBox}>
                    <Text style={styles.timerTextCurrentPhase}>{currentPhase}</Text>
                </View>
            </View>

        </View>
    )
}


const styles = StyleSheet.create({

    container: {
        display: "flex",
        width: "100%",
        height: "88%",
        justifyContent: "space-evenly",
        alignItems: "center",
        backgroundColor: "#FFFAF4",
    },
    
    pomodoroBox: {
        width: "60%",
        height: 150,
        backgroundColor: "#CBE3E0",
    },

    pomodoroNameBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 90,
        backgroundColor: "#CBE3E0"
    },

    pomodoroButtonsBox: {
        width: "100%",
        height: 60,
        backgroundColor: "#F5F5F5"
    },

    pomodoroActionsButtonsBox: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "50%",
        backgroundColor: "pink"
    },

    pomodoroActionsButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "33.33%",
        height: "100%",
    },

    pomodoroActionStart: {
        backgroundColor: "#0B8475"
    },

    pomodoroActionPause: {
        backgroundColor: "#34B8A7"
    },

    pomodoroActionStop: {
        backgroundColor: "#90BFB9"
    },

    pomodoroConfigButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "50%",
        backgroundColor: "#5E968F"
    },

    pomodoroTextTitle: {
        color: "#000",
        fontSize: 24,
        fontFamily: "Inter_700Bold",
    },

    pomodoroTextButtons: {
        fontFamily: "Inter_700Bold",
        color: "#FFF"
    },

    timerBox: {
        display: "flex",
        width: "80%",
        alignItems: "center",
    },

    timerWorkingBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "95%",
    },

    timerShortAndLongBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },

    timerCurrentPhaseBox: {
        marginTop: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#9C9393",
    },

    timerTextWorking: {
        fontFamily: "Inter_300Light",
        fontSize: 64,
    },

    timerTextShort: {
        fontFamily: "Inter_300Light",
        fontSize: 32,
        color: "#361ECB",
    },

    timerTextLong: {
        fontFamily: "Inter_300Light",
        fontSize: 32,
        color: "#C21212",
    },

    timerTextCurrentPhase: {
        fontFamily: "Inter_300Light",
        color: "#FFF",
        fontSize: 24,
    }

})