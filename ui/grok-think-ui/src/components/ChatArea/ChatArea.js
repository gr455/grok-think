import React, { useState, useEffect } from 'react'
import './ChatArea.css'
import PromptBox from '../PromptBox/PromptBox.js'
import UserMessage from '../UserMessage/UserMessage.js'

const handleSend = (sn) => {}

const ChatArea = () => {
	const [messageHistory, setMessageHistory] = useState([]);
	return (
		<div className="chat-area-container">
			<div className="chat-area-messages">
				<UserMessage message="hello"/>
				<UserMessage message="hello"/>
				<UserMessage message="hello"/>
				<UserMessage message="hello"/>
				<UserMessage message="hello"/>
			</div>
			<PromptBox handleSend={handleSend} canSend={true}/>
			<div className="chat-area-foot">Komik can make mistakes. But they will be funny</div>
		</div>
		)
}

export default ChatArea;