import React, { useState, useEffect } from 'react'
import './ChatArea.css'
import PromptBox from '../PromptBox/PromptBox.js'
import UserMessage from '../UserMessage/UserMessage.js'
import SystemMessage from '../SystemMessage/SystemMessage.js'

const KOMIK_SERVICE_ENDPOINT = "http://localhost:3000/chat"

const ChatArea = () => {
	const [messageHistory, setMessageHistory] = useState([]);
	const [canSend, setCanSend] = useState(true);
	const [currentSystemThought, setCurrentSystemThought] = useState("");
	const [currentSystemMessage, setCurrentSystemMessage] = useState("");
	const [currentSystemError, setCurrentSystemError] = useState("");

	const handleSend = (prompt) => {
		const message = { role: "user", message: prompt }
		setMessageHistory(prev => [...prev, message]);
		// setCanSend(false);
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
					if (done) { console.log("BIG BOI DONE"); break};

					buffer += decoder.decode(value, {stream: true});

					const chunks = buffer.split("\n\n");
					console.log(value)
					buffer = chunks.pop(); // incomplete chunk stays in buffer

					for (const chunk of chunks) {
						console.log("Chunky chunk")
						const chunkData = JSON.parse(chunk.replace("data: ", ""));
						if (chunkData.done) {
							console.log("is done");
							const thisMessage = {
								role: "system",
								thought: currentSystemThought,
								message: currentSystemMessage,
								thoughtFor: 0
							}

							setMessageHistory(prev => [...prev, thisMessage])
							setCurrentSystemError("");
							setCurrentSystemMessage("");
							setCurrentSystemThought("");
							break;
						}

						if (chunkData.error) {
							console.log("is error");
							const thisMessage = {
								role: "system",
								errorMessage: chunkData.error
							}

							setMessageHistory(prev => [...prev, thisMessage])
							setCurrentSystemError("");
							setCurrentSystemMessage("");
							setCurrentSystemThought("");
							break;
						}

						if (chunkData.thought) {
							console.log("is thought");
							setCurrentSystemThought(prev => prev + chunkData.thought);
						} else if (chunkData.response) {
							console.log("is message");
							setCurrentSystemMessage(prev => prev + chunkData.response);
						}

					}

				}

			} catch (err) {
				console.log(`ERROR: ${err}`);
				const thisMessage = {
					role: "system",
					errorMessage: err
				}

				setMessageHistory(prev => [...prev, thisMessage])
				setCurrentSystemError("");
				setCurrentSystemMessage("");
				setCurrentSystemThought("");
			}


		})();


	}, [messageHistory])

	return (
		<div className="chat-area-container">
			<div className="chat-area-messages">
				{ makeMessageHistory(messageHistory) }
				{ makeCurrentSystemResponse(currentSystemThought, currentSystemMessage, currentSystemError) }
			</div>
			<PromptBox handleSend={handleSend} canSend={canSend}/>
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
	return <UserMessage key="new" message={thought + "\n---\n" + message + "\n---\n" + error} />
}



export default ChatArea;
