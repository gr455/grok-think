import React, { useState, useEffect } from 'react'
import './ChatArea.css'
import PromptBox from '../PromptBox/PromptBox.js'
import UserMessage from '../UserMessage/UserMessage.js'
import SystemMessage from '../SystemMessage/SystemMessage.js'
import { useTimer } from '../../hooks/Timer.js'

const KOMIK_SERVICE_ENDPOINT = "http://localhost:3000/chat"

// Response state constants
const STATE_IDLE = "STATE_IDLE"
const STATE_USER_CREATED_REQUEST = "STATE_USER_CREATED_REQUEST";
const STATE_THINKING_STARTED = "STATE_THINKING_STARTED";
const STATE_RESPONSE_STARTED = "STATE_RESPONSE_STARTED";
const STATE_DONE = "STATE_DONE";

const ChatArea = () => {
	const [messageHistory, setMessageHistory] = useState([]);
	const [responseState, setResponseState] = useState(STATE_IDLE);
	const [currentSystemResponse, setCurrentSystemResponse] = useState({
		thought: "",
		message: "",
		error: ""
	});
	const lastRequestThinkingSeconds = useTimer(responseState);

	const handleSend = (prompt) => {
		const message = { role: "user", message: prompt }
		setMessageHistory(prev => [...prev, message]);
		setResponseState(STATE_USER_CREATED_REQUEST);
	}

	useEffect(() => {
		const lastMessage = messageHistory[messageHistory.length - 1];
		if (!lastMessage || lastMessage.role !== "user") return;
		if (responseState !== STATE_USER_CREATED_REQUEST) return;

		(async () => {
			const params = new URLSearchParams(window.location.search);
			try {
				setResponseState(STATE_THINKING_STARTED)
				const komikResponse = await fetch(KOMIK_SERVICE_ENDPOINT, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({input: lastMessage.message, codeword: params.get('codeword')})
				})

				if (komikResponse.status == 401) {
					setCurrentSystemResponse(prev => ({
						...prev,
						error: "Wrong codeword. Did you set query param 'codeword'?"
					}));
					setResponseState(STATE_DONE);
					return
				}
				else if (komikResponse.status == 429) {
					setCurrentSystemResponse(prev => ({
						...prev,
						error: "Rate limited, please try again in a minute"
					}));
					setResponseState(STATE_DONE);
					return
				}
				else if (komikResponse.status != 200) throw "Error ocurred"

				setResponseState(STATE_THINKING_STARTED);
				
				const reader = komikResponse.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, {stream: true});

					const chunks = buffer.split("\n\n");
					buffer = chunks.pop(); // incomplete chunk stays in buffer

					for (const chunk of chunks) {
						const chunkData = JSON.parse(chunk.replace("data: ", ""));
						if (chunkData.done) {
							console.log("is done")
							setResponseState(STATE_DONE);
							break;
						}

						if (chunkData.error) {
							setCurrentSystemResponse(prev => ({
								...prev,
								error: chunkData.error
							}));
							setResponseState(STATE_DONE);
							break;
						}

						if (chunkData.thought) {
							setCurrentSystemResponse(prev => ({
								...prev,
								thought: prev.thought + chunkData.thought
							}));
						} else if (chunkData.response) {
							setResponseState(STATE_RESPONSE_STARTED)
							setCurrentSystemResponse(prev => ({
								...prev,
								message: prev.message + chunkData.response
							}));
						}
					}
				}

			} catch (err) {
				console.log(`ERROR: ${err}`);
				setCurrentSystemResponse(prev => ({
					...prev,
					error: "Internal error ocurred"
				}));
				setResponseState(STATE_DONE);
			}
		})();
	}, [messageHistory])

	useEffect(() => {
		if (responseState === STATE_DONE) {
			const thisMessage = {
				role: "system",
				thought: currentSystemResponse.thought,
				thoughtFor: lastRequestThinkingSeconds,
				message: currentSystemResponse.message,
				errorMessage: currentSystemResponse.error
			}

			setMessageHistory(prev => [...prev, thisMessage])
			setCurrentSystemResponse({
				thought: "",
				message: "",
				error: ""
			});
			setResponseState(STATE_IDLE)
		}
	}, [responseState])

	return (
		<div className="chat-area-container">
			<div className="chat-area-messages-wrapper">
				<div className="chat-area-messages">
					{ makeMessageHistory(messageHistory, responseState) }
					{ makeCurrentSystemResponse(
						currentSystemResponse.thought, 
						currentSystemResponse.message,
						lastRequestThinkingSeconds,
						currentSystemResponse.error,
						responseState
					) }
				</div>
			</div>

			<div className="chat-area-bottom-wrapper">
				<PromptBox handleSend={handleSend} canSend={responseState === STATE_IDLE}/>
				<div className="chat-area-foot">Komik never makes mistakes. It changes reality to match its answers</div>
			</div>
		</div>
	)
}

const makeMessageHistory = (history) => {
	return history.map((historyItem, idx) => {
		if (historyItem.role === "user") {
			return <UserMessage key={idx} message={historyItem.message}/>
		} else if (historyItem.role === "system") {
			return <SystemMessage key={idx} thought={historyItem.thought} message={historyItem.message} thoughtFor={historyItem.thoughtFor} error={historyItem.errorMessage} state={STATE_DONE} />
		} else {}
	})
}

const makeCurrentSystemResponse = (thought, message, thoughtFor, error, state) => {
	if (!thought && !message && !error) return null;
	return <SystemMessage key="new" thought={thought} message={message} thoughtFor={thoughtFor} err={error} state={state} />
}

export default ChatArea;