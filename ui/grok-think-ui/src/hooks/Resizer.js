import React, { useState, useEffect, useRef } from 'react'

const useResizeObserver = (ref, callback, state) => {
	useEffect(() => {
		if (!ref?.current) return;
		const resizeObserver = new ResizeObserver(callback);
		resizeObserver.observe(ref.current);

		return () => {
			if (!ref?.current) return;
			resizeObserver.unobserve(ref.current);
		}
	}, [state]);
}

export { useResizeObserver };