import React, { useEffect, useRef } from 'react';


// Response state constants
const STATE_IDLE = "STATE_IDLE"
const STATE_USER_CREATED_REQUEST = "STATE_USER_CREATED_REQUEST";
const STATE_THINKING_STARTED = "STATE_THINKING_STARTED";
const STATE_RESPONSE_STARTED = "STATE_RESPONSE_STARTED";
const STATE_DONE = "STATE_DONE";

const useSmoothScrollBottom = (ref, state) => {
	const intervalRef = useRef(null);

	useEffect(() => {
		if (state === STATE_THINKING_STARTED) {
			if (intervalRef.current) return;
			intervalRef.current = setInterval(() => {
				if (!ref?.current) return;
				let scrollTarget = Math.min(ref.current.scrollTop + quickScroll(ref.current.scrollTop, ref.current.scrollHeight), ref.current.scrollHeight);
				ref.current.scrollTo({
					top: scrollTarget,
					behaviour: "smooth"
				})
			}, 20);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}
	}, [state])
}

const quickScroll = (scrollAt, targetAt) => {
	return Math.ceil((targetAt - scrollAt)/scrollAt) * 2;
}

const useScrollTo = (ref, state) => {
	useEffect(() => {
		console.log("BRUH: ", state);
		if (state === STATE_THINKING_STARTED && ref?.current) {
			ref.current.scrollIntoView({ behaviour: "smooth" })
		}
	}, [state])
}

export { useSmoothScrollBottom, useScrollTo };