import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native"
import type { TimerInfo } from "../types/Timer"


type ConfigPomodoroProps = {
    setScreenPomodoro: Function
    setScreenConfig: Function
}


export default function ConfigPomodoro({ setScreenPomodoro, setScreenConfig }: ConfigPomodoroProps) {

    const [working, setWorking] = useState(0)
    const [shortPause, setShortPause] = useState(0)
    const [longPause, setLongPause] = useState(0)
    const [cycles, setCycles] = useState(0)

    const changeToPomodoro = () => {
        setScreenConfig(false)
        setScreenPomodoro(true)
    }

    const handlePressSave = () =>{
        const info: TimerInfo = { SHORT_INTERVAL: shortPause, LONG_INTERVAL: longPause, WORKING_TIME: working, CYCLE: cycles }
        saveNewInfo(info)
        changeToPomodoro()
    }

    const saveNewInfo = async (info: TimerInfo)=> {
        await AsyncStorage.setItem("timerInfo", JSON.stringify(info))
    }
    

    return(
        <View style={styles.container}>

            <TextInput
                style={styles.input}
                placeholder="WORKING TIME"
                keyboardType="numeric"
                onChangeText={value => setWorking(Number(value))}
            />

            <TextInput
                style={styles.input}
                placeholder="SHORT PAUSE"
                keyboardType="numeric"

                onChangeText={value => setShortPause(Number(value))}
            />

            <TextInput
                style={styles.input}
                placeholder="LONG PAUSE"
                keyboardType="numeric"
                onChangeText={value => setLongPause(Number(value))}
            />

            <TextInput
                style={styles.input}
                placeholder="CYCLES"
                keyboardType="numeric"
                onChangeText={value => setCycles(Number(value))}
            />

            <View style={styles.buttons}>
                <TouchableOpacity onPress={changeToPomodoro} style={[styles.button, styles.cancel]}>
                    <Text style={styles.buttonText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePressSave} style={[styles.button, styles.save]}>
                    <Text style={styles.buttonText}>SAVE</Text>
                </TouchableOpacity> 
            </View>

        </View>
    )
}


const styles = StyleSheet.create({
  
    container: {
        display: "flex",
        width: "100%",
        height: "88%",
        justifyContent: "center",
        alignItems: "center",
        rowGap: 20,
        backgroundColor: "#FFFAF4",
    },

    input: {
        width: "80%",
        height: 80,
        textAlign: "center",
        backgroundColor: "#F8F2EC",
        padding: 10,
        fontFamily: "Inter_300Light",
        fontSize: 24,
    },
    
    buttons: {
        display: "flex",
        flexDirection: "row",
        width: "80%",
        justifyContent: "space-between",
    },
    
    button: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "40%",
        height: 80,
    },

    save: {
        backgroundColor: "#A2CB26",
    },
    
    cancel: {
        backgroundColor: "#CB4E26",
    },

    buttonText: {
        color: "#FFF",
        textAlign: "center",
        fontFamily: "Inter_700Bold",
        fontSize: 24,
    }

})