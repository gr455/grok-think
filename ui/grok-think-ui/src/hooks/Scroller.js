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
				console.log(ref.current.scrollTop)
				ref.current.scrollTo({
					top: Math.min(ref.current.scrollTop + 1, ref.current.scrollHeight),
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

export { useSmoothScrollBottom };