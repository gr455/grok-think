import React, { useState } from 'react'
import './PromptBox.css'

const PromptBox = ({handleSend}) => {
	const [prompt, setPrompt] = useState("")

	const handleEnter = (e) => {
		if (e.key === "Enter" && prompt.trim() !== "") {
			handleSend(prompt.trim());
			setPrompt("");
		}
	}

	const handleClick = (e) => {
		if (prompt.trim() !== "") {
			handleSend(prompt.trim());
			setPrompt("");
		}
	}

	const handleChange = (e) => {
		setPrompt(e.target.value)
	}

	return (
		<div className="promptbox-container">
			<input type="text" className="promptbox-input" value={prompt} onChange={handleChange} onKeyDown={handleEnter} placeholder="How can Komik help?"></input>
			<div className="promptbox-buttongroup">
				<div className="promptbox-leftside-buttons">
					<button className="promptbox-button-thinkmode" disabled="true">Think Mode On</button>
				</div>
				<div className="promptbox-rightside-buttons">
					<button className="promptbox-button-send" disabled={prompt === ""} onClick={handleClick}>↑</button>
				</div>
			</div>
		</div>
	)
}


export default PromptBox;