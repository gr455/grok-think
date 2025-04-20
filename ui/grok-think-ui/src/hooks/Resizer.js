import React, { useState, useEffect, useRef } from 'react'

const useResizeObserver = (ref, callback, state) => {
	useEffect(() => {
		if (!ref) return;
		const resizeObserver = new ResizeObserver(callback);
		resizeObserver.observe(ref);

		return () => {
			if (!ref) return;
			resizeObserver.unobserve(ref);
		}
	}, [state]);
}

export { useResizeObserver };