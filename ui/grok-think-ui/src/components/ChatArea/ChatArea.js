import React, { useState, useEffect } from 'react'
import './ChatArea.css'
import PromptBox from '../PromptBox/PromptBox.js'
import UserMessage from '../UserMessage/UserMessage.js'
import SystemMessage from '../SystemMessage/SystemMessage.js'

const KOMIK_SERVICE_ENDPOINT = "http://localhost:3000/chat"

const ChatArea = () => {
	const [messageHistory, setMessageHistory] = useState([]);
	const [canSend, setCanSend] = useState(true);
	const [currentSystemMessage, setCurrentSystemMessage] = useState("");

	const handleSend = (prompt) => {
		const message = { role: "user", message: prompt }
		setMessageHistory(prev => [...prev, message]);
		// setCanSend(false);
	}

	useEffect(() => {
		const lastMessage = messageHistory[messageHistory.length - 1];
		if (lastMessage && lastMessage.role !== "user") return;


	}, [messageHistory])

	return (
		<div className="chat-area-container">
			<div className="chat-area-messages">
				{ makeMessageHistory(messageHistory) }
			</div>
			<PromptBox handleSend={handleSend} canSend={canSend}/>
			<div className="chat-area-foot">Komik can make mistakes. But they will be funny</div>
		</div>
		)
}

const makeMessageHistory = (history) => {
	return history.map(historyItem => {
		if (historyItem.role === "user") {
			return <UserMessage message={historyItem.message}/>
		} else if (historyItem.role === "system") {
			return <SystemMessage thought={historyItem.thought} message={historyItem.message} thoughtFor={historyItem.thoughtFor}/>
		} else {}
	})
}

export default ChatArea;