import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, View } from "react-native"
import { Inter_400Regular, Inter_300Light, Inter_700Bold,useFonts } from "@expo-google-fonts/inter"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import Pomodoro from "./components/Pomodoro"
import ConfigPomodoro from "./components/ConfigPomodoro"


SplashScreen.preventAutoHideAsync()


export default function App() {

	const [screenPomodoro, setScreenPomodoro] = useState(true)
	const [screenConfig, setScreenConfig] = useState(false)

	const [loaded, error] = useFonts({
		Inter_300Light,
		Inter_400Regular,
        Inter_700Bold
	})

	useEffect(()=>{
		if (loaded || error) {
			SplashScreen.hideAsync()
		}
	}, [loaded, error])

	if (!loaded && !error) {
		return null
	}

  	return (
		<View style={styles.container}>
			<StatusBar style="light" backgroundColor="#000" hidden={true}/>

        	<View style={styles.navbar}>
            	<Text style={styles.title} >FOCUS</Text>
        	</View>

			{screenPomodoro ? (
				<Pomodoro setScreenPomodoro={setScreenPomodoro} setScreenConfig={setScreenConfig} />
			) : (
				null
			)}

			{screenConfig ? (
				<ConfigPomodoro setScreenPomodoro={setScreenPomodoro} setScreenConfig={setScreenConfig}/>
			) : (
				null
			)}

    	</View>
  	)
}


const styles = StyleSheet.create({

	container: {
		flex: 1,
	},

	navbar: {
		display: "flex",
		width: "100%",
		height: "12%",
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#CCFF33",
  	},

  	title: {
		fontSize: 56,
        fontFamily: "Inter_400Regular",
  	}
})
