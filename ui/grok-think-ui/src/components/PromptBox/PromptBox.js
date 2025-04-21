import React, { useState } from 'react'
import './PromptBox.css'
import { FaArrowUp, FaSquare } from 'react-icons/fa';
import { HiLightBulb } from 'react-icons/hi';

const PromptBox = ({handleSend, canSend, handleAbort, canAbort}) => {
	const [prompt, setPrompt] = useState("")

	const handleEnter = (e) => {
		if (!canSend) return;
		if (e.key === "Enter" && !e.shiftKey && prompt.trim() !== "") {
			e.preventDefault();
			handleSend(prompt.trim());
			setPrompt("");
		}
	}

	const handleSendClick = (e) => {
		if (prompt.trim() !== "") {
			handleSend(prompt.trim());
			setPrompt("");
		}
	}

	const handleAbortClick = (e) => {
		handleAbort();
	}

	const handleChange = (e) => {
		setPrompt(e.target.value)
	}

	return (
		<div className="promptbox-container">
			<textarea type="text" className="promptbox-input" value={prompt} onChange={handleChange} onKeyDown={handleEnter} placeholder="How can Komik help?"></textarea>
			<div className="promptbox-buttongroup">
				<div className="promptbox-leftside-buttons">
					<button className="promptbox-button-thinkmode" disabled={true}><HiLightBulb /> Think</button>
				</div>
				<div className="promptbox-rightside-buttons">
					<button className="promptbox-button-modelname">GPT-4o mini</button>
					{!canAbort && <button className="promptbox-button-send" disabled={prompt.trim() === "" || !canSend} onClick={handleSendClick}><FaArrowUp/></button>}
					{canAbort && <button className="promptbox-button-abort" onClick={handleAbortClick}><FaSquare/></button>}
				</div>
			</div>
		</div>
	)
}


export default PromptBox;