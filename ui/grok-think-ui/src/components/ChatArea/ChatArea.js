import React, { useState, useEffect } from 'react'
import './ChatArea.css'
import PromptBox from '../PromptBox/PromptBox.js'
import UserMessage from '../UserMessage/UserMessage.js'
import SystemMessage from '../SystemMessage/SystemMessage.js'

const KOMIK_SERVICE_ENDPOINT = "http://localhost:3000/chat"

const ChatArea = () => {
	const [messageHistory, setMessageHistory] = useState([]);
	const [responseDone, setResponseDone] = useState(false);
	const [currentSystemThought, setCurrentSystemThought] = useState("");
	const [currentSystemMessage, setCurrentSystemMessage] = useState("");
	const [currentSystemError, setCurrentSystemError] = useState("");

	const handleSend = (prompt) => {
		const message = { role: "user", message: prompt }
		setMessageHistory(prev => [...prev, message]);
		setResponseDone(false);
	}

	useEffect(() => {
		const lastMessage = messageHistory[messageHistory.length - 1];
		if (!lastMessage || lastMessage.role !== "user") return;

		(async () => {
			const params = new URLSearchParams(window.location.search);
			try {
				const komikResponse = await fetch(KOMIK_SERVICE_ENDPOINT, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({input: lastMessage.message, codeword: params.get('codeword')})
				})

				const reader = komikResponse.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, {stream: true});

					const chunks = buffer.split("\n\n");
					console.log(value)
					buffer = chunks.pop(); // incomplete chunk stays in buffer

					for (const chunk of chunks) {
						const chunkData = JSON.parse(chunk.replace("data: ", ""));
						if (chunkData.done) {
							console.log("is done")
							setResponseDone(true);
							break;
						}

						if (chunkData.error) {
							setCurrentSystemError(chunkData.error);
							setResponseDone(true);
							break;
						}

						if (chunkData.thought) {
							setCurrentSystemThought(prev => prev + chunkData.thought);
						} else if (chunkData.response) {
							setCurrentSystemMessage(prev => prev + chunkData.response);
						}

					}

				}

			} catch (err) {
				console.log(`ERROR: ${err}`);
				setCurrentSystemError("Internal error ocurred");
			}


		})();
	}, [messageHistory])

	useEffect(() => {
		if (responseDone) {
			const thisMessage = {
				role: "system",
				thought: currentSystemThought,
				message: currentSystemMessage,
				error: currentSystemError
			}

			setMessageHistory(prev => [...prev, thisMessage])
			setCurrentSystemMessage("")
			setCurrentSystemError("")
			setCurrentSystemThought("")
		}
	},[responseDone])

	return (
		<div className="chat-area-container">
			<div className="chat-area-messages">
				{ makeMessageHistory(messageHistory) }
				{ makeCurrentSystemResponse(currentSystemThought, currentSystemMessage, currentSystemError) }
			</div>
			<PromptBox handleSend={handleSend} canSend={responseDone || messageHistory.length == 0}/>
			<div className="chat-area-foot">Komik can make mistakes. But they will be funny</div>
		</div>
		)
}

const makeMessageHistory = (history) => {
	return history.map((historyItem, idx) => {
		if (historyItem.role === "user") {
			return <UserMessage key={idx} message={historyItem.message}/>
		} else if (historyItem.role === "system") {
			return <SystemMessage key={idx} thought={historyItem.thought} message={historyItem.message} thoughtFor={historyItem.thoughtFor} err={historyItem.errorMessage}/>
		} else {}
	})
}

const makeCurrentSystemResponse = (thought, message, error) => {
	if (!thought && !message && !error) return null;
	return <SystemMessage key="new" thought={thought} message={message} thoughtFor={0} err={error}/>
}



export default ChatArea;
