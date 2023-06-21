import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Aurora from "./Aurora";


import Cookies from "js-cookie";
import axios from "axios";

function App() {
	//AUTH
	const [password, setPassword] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState("");
	const [fin, setFin] = useState(false);
	const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

	const generalPassword = "sync1234";
	const cookieName = "isLoggedInCookie";

	//TIMER
	const [isPressing, setIsPressing] = useState(false);
	const [timer, setTimer] = useState(0);
	let timerId;

	useEffect(() => {
		const isUserLoggedIn = Cookies.get(cookieName);
		const isUsername = Cookies.get("username");
		if (isUserLoggedIn) {
			setIsLoggedIn(true);
		}

		if (isUsername) {
			setUser(isUsername);
		}

		if (isPressing) {
			timerId = setTimeout(() => {
				setTimer(timer + 1);
			}, 1000);
		} else {
			clearTimeout(timerId);
		}

		if (timer === 30) {
			saveTimeToNotion(timer);
			setFin(true);
			setTimeout(() => {
				setFin(false);
			}, 2000);
		}

		return () => {
			clearTimeout(timerId);
		};
	}, [isPressing, timer]);

	const getCurrentTime = () => {
		const currentTime = new Date();
		const formattedTime = currentTime.toISOString();
		return formattedTime;
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	};

	const handleUserChange = (e) => {
		setUser(e.target.value);
	};

	const handleLogin = () => {
		if (password === generalPassword) {
			setIsLoggedIn(true);
			Cookies.set(cookieName, true); // Set cookie to expire in 7 days
			Cookies.set("username", user); // Set cookie to expire in 7 days
		} else {
			alert("Incorrect password. Please try again.");
		}
	};

	const handleButtonPress = () => {
		setIsPressing(true);
	};

	const handleButtonRelease = () => {
		setIsPressing(false);
		setTimer(0);
	};

	const handelTouchDown = (e) => {
		const { clientX, clientY } = e.touches[0];
		setCoordinates({ x: clientX, y: clientY });
		setIsPressing(true);
	};

	const saveTimeToNotion = async (time) => {
		const currentTime = getCurrentTime();
		/*
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const latitude = position.coords.latitude;
					const longitude = position.coords.longitude;

					// Use the latitude and longitude values as needed
					console.log("Latitude:", latitude);
					console.log("Longitude:", longitude);

					console.log(currentTime);
					try {
						// Make a request to your backend API to save the time to Notion
						axios
							.post(
								"https://bookclub-api-c934.onrender.com/addsync",
								{
									user: user,
									date: currentTime,
									latitude: latitude,
									longitude: longitude,
								}
							)
							.then((res) => console.log(res))
							.catch((err) => console.log(err));
						console.log("Time saved to Notion successfully.");
					} catch (error) {
						console.error("Error saving time to Notion:", error);
					}

					// Make an API request to retrieve more detailed geo data based on the latitude and longitude
					// Example API call:
					// axios.get(`https://api.example.com/geo-data?lat=${latitude}&lng=${longitude}`)
				},
				(error) => {
					console.error("Error retrieving geo data:", error);
				}
			);
		} else {
		*/
		const latitude = 0.0;
		const longitude = 0.0;

		// Use the latitude and longitude values as needed
		console.log("Latitude:", latitude);
		console.log("Longitude:", longitude);

		console.log(currentTime);
		try {
			// Make a request to your backend API to save the time to Notion
			axios
				.post("https://bookclub-api-c934.onrender.com/addsync", {
					user: user,
					date: currentTime,
					latitude: latitude,
					longitude: longitude,
				})
				.then((res) => console.log(res))
				.catch((err) => console.log(err));
			console.log("Time saved to Notion successfully.");
		} catch (error) {
			console.error("Error saving time to Notion:", error);
		}
	};

	return (
		<div>
			{!isLoggedIn ? (
				<div>
					<h2>Login</h2>
					<input
						type="user"
						value={user}
						onChange={handleUserChange}
					/>
					<input
						type="password"
						value={password}
						onChange={handlePasswordChange}
					/>
					<button onClick={handleLogin}>Log In</button>
				</div>
			) : (
				<div>
					{isPressing ? (
						""
					) : (
						<button className="user">
							<span>⬤</span> {user}
						</button>
					)}
					{fin ? (
						<div className="fin">
							<div className="bg-sec">
								<p>📡</p>
							</div>
						</div>
					) : (
						""
					)}
					<div className="bg">
						{isPressing && !fin ? (
							<div className="bg-sec">
								<p></p>
							</div>
						) : (
							""
						)}
					</div>
					<Aurora
						startCount={() => {
							setIsPressing(true);
						}}
						stopCount={() => setIsPressing(false)}
					/>
					<motion.div
						className="test"
						animate={{
							opacity: isPressing && !fin ? 1 : 0,
							y: isPressing && !fin ? 0 : -10,
						}}
					>
						<p>
							hold for {30 - timer} seconds and focus on
							<img
								className="focus-image"
								src="https://i.discogs.com/sWkhipzXolASaZxp302QiiUpgTp93hetfv5kyMupyH4/rs:fit/g:sm/q:90/h:771/w:597/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTE0NTI0/MzEtMTI0MjQ1MzY1/NC5qcGVn.jpeg"
								alt=""
							/>
						</p>
					</motion.div>
					<div className="text">
						<h1>Tap anywhere on the screen</h1>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
