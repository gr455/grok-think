import React, { useState, useEffect, useRef } from 'react'
import './ThinkBox.css'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Response state constants
const STATE_IDLE = "STATE_IDLE"
const STATE_USER_CREATED_REQUEST = "STATE_USER_CREATED_REQUEST";
const STATE_THINKING_STARTED = "STATE_THINKING_STARTED";
const STATE_RESPONSE_STARTED = "STATE_RESPONSE_STARTED";
const STATE_DONE = "STATE_DONE";


const ThinkBox = ({thought, thoughtFor, state}) => {
	const [expanded, setExpanded] = useState(false);
	const [thoughtContainerHeight, setThoughtContainerHeight] = useState(0)
	const thoughtBoxRef = useRef(null);

	useEffect(() => {
		if (expanded) {
			const computedStyle = window.getComputedStyle(thoughtBoxRef.current);
			const totalMargins = parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
			setThoughtContainerHeight(thoughtBoxRef.current.scrollHeight + totalMargins);
		} else {
			setThoughtContainerHeight(0);
		}
	}, [expanded])

	const handleThinkBoxClick = (e) => {
		setExpanded(prev => !prev)
	}

	if (state === STATE_THINKING_STARTED) {

	}

	return (
		<div className="thinkbox-container">
			<div className="thinkbox-box">
				<div className="thinkbox-box-toprow" onClick={handleThinkBoxClick}>
					<div className="thinkbox-timer"><span><b>Thought for</b> <span className="thought-seconds">{thoughtFor}s</span></span></div>
					{expanded ? <div className="thinkbox-expand-collapse"><FaChevronUp /></div> : <div className="thinkbox-expand-collapse"><FaChevronDown /></div>}
				</div>
				<div className="thinkbox-box-midrow" onClick={handleThinkBoxClick}>
					<div className="thinkbox-expand-collapse-text">{expanded ? "Collapse details" : "Expand details"}</div>
				</div>
				<div className="thinkbox-box-thought-container" style={{maxHeight: `${thoughtContainerHeight}px`}}>
					<div className="thinkbox-thought" ref={thoughtBoxRef}>{thought}</div>
				</div>
			</div>
		</div>
		)
}

export default ThinkBox;