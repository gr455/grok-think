import React, { useState, useEffect, useRef } from 'react'

// Response state constants
const STATE_IDLE = "STATE_IDLE"
const STATE_USER_CREATED_REQUEST = "STATE_USER_CREATED_REQUEST";
const STATE_THINKING_STARTED = "STATE_THINKING_STARTED";
const STATE_RESPONSE_STARTED = "STATE_RESPONSE_STARTED";
const STATE_DONE = "STATE_DONE";


const useTimer = (state) => {
	const [seconds, setSeconds] = useState(0);
	const intervalRef = useRef(null);

	const mustCreateNewTimer = state === STATE_USER_CREATED_REQUEST;
	const mustStopTimer = state === STATE_RESPONSE_STARTED || state === STATE_DONE;

	useEffect(() => {
		if (mustCreateNewTimer) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}

			setSeconds(0);

			intervalRef.current = setInterval(() => {
				setSeconds(prev => prev + 1)
			}, 1000);

		} else if (mustStopTimer) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}
	}, [state])

	return seconds;
}

export {useTimer}