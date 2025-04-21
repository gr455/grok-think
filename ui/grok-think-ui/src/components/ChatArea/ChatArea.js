import React, { useState, useEffect, useRef } from 'react'
import './ChatArea.css'
import PromptBox from '../PromptBox/PromptBox.js'
import UserMessage from '../UserMessage/UserMessage.js'
import SystemMessage from '../SystemMessage/SystemMessage.js'
import { useTimer } from '../../hooks/Timer.js'
import { useScrollTo } from '../../hooks/Scroller.js'

const KOMIK_SERVICE_HOST = process.env.REACT_APP_KOMIK_SERVICE_HOST;
const KOMIK_SERVICE_ENDPOINT = `${KOMIK_SERVICE_HOST}/chat`

// Response state constants
const STATE_IDLE = "STATE_IDLE"
const STATE_USER_CREATED_REQUEST = "STATE_USER_CREATED_REQUEST";
const STATE_THINKING_STARTED = "STATE_THINKING_STARTED";
const STATE_RESPONSE_STARTED = "STATE_RESPONSE_STARTED";
const STATE_DONE = "STATE_DONE";
const STATE_ABORTED = "STATE_ABORTED";

const ChatArea = () => {
	const [messageHistory, setMessageHistory] = useState([]);
	const [responseState, setResponseState] = useState(STATE_IDLE);
	const [currentSystemResponse, setCurrentSystemResponse] = useState({
		thought: "",
		message: "",
		error: ""
	});
	const chatAreaBottomRef = useRef(null);
	const aborted = useRef(false);
	const lastRequestThinkingSeconds = useTimer(responseState);

	const handleSend = (prompt) => {
		const message = { role: "user", message: prompt }
		setMessageHistory(prev => [...prev, message]);
		setResponseState(STATE_USER_CREATED_REQUEST);
	}

	const handleAbort = () => {
		aborted.current = true;
	}

	useScrollTo(chatAreaBottomRef, responseState)

	useEffect(() => {
		const lastMessage = messageHistory[messageHistory.length - 1];
		if (!lastMessage || lastMessage.role !== "user") return;
		if (responseState !== STATE_USER_CREATED_REQUEST) return;

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
				
				const reader = komikResponse.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				setResponseState(STATE_THINKING_STARTED);
				while (true) {
					// handle abort
					if (aborted.current) {
						setResponseState(STATE_ABORTED);
						return
					}

					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, {stream: true});

					const chunks = buffer.split("\n\n");
					buffer = chunks.pop(); // incomplete chunk stays in buffer

					for (const chunk of chunks) {
						const chunkData = JSON.parse(chunk.replace("data: ", ""));
						if (chunkData.done) {
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
		if (responseState === STATE_DONE || responseState === STATE_ABORTED) {
			const thisMessage = {
				role: "system",
				thought: currentSystemResponse.thought,
				thoughtFor: lastRequestThinkingSeconds,
				message: currentSystemResponse.message,
				aborted: responseState === STATE_ABORTED,
				errorMessage: currentSystemResponse.error
			}

			setMessageHistory(prev => [...prev, thisMessage])
			setCurrentSystemResponse({
				thought: "",
				message: "",
				error: ""
			});

			aborted.current = false;
			setResponseState(STATE_IDLE)
		}
	}, [responseState]);

	return (
		<div className="chat-area-container">
			<div className="chat-area-messages-wrapper">
				<div className="chat-area-messages">
					{ makeMessageHistory(messageHistory, responseState) }
					{ ([STATE_THINKING_STARTED, STATE_RESPONSE_STARTED, STATE_DONE].includes(responseState) && makeCurrentSystemResponse(
											currentSystemResponse.thought, 
											currentSystemResponse.message,
											lastRequestThinkingSeconds,
											currentSystemResponse.error,
											responseState,
										)) || (responseState === STATE_USER_CREATED_REQUEST && processingDot())}
				</div>
				<div className="chat-area-bottom-ref" ref={chatAreaBottomRef}></div>
			</div>
			<div className="chat-area-bottom-wrapper">
				<PromptBox handleSend={handleSend} handleAbort={handleAbort} canSend={responseState === STATE_IDLE} canAbort={[STATE_THINKING_STARTED, STATE_RESPONSE_STARTED, STATE_USER_CREATED_REQUEST].includes(responseState)}/>
				<div className="chat-area-foot">Komik never makes mistakes. <span id="funny">It changes reality to match its answers</span></div>
			</div>
		</div>
	)
}

const makeMessageHistory = (history) => {
	return history.map((historyItem, idx) => {
		if (historyItem.role === "user") {
			return <UserMessage key={idx} message={historyItem.message}/>
		} else if (historyItem.role === "system") {
			return <SystemMessage key={idx} thought={historyItem.thought} message={historyItem.message} thoughtFor={historyItem.thoughtFor} error={historyItem.errorMessage} aborted={historyItem.aborted} state={STATE_DONE} />
		} else {}
	})
}

const makeCurrentSystemResponse = (thought, message, thoughtFor, error, state) => {
	if (!thought && !message && !error) return null;
	return <SystemMessage key="new" thought={thought} message={message} thoughtFor={thoughtFor} err={error} state={state} />
}

const processingDot = () => {
	return <div className="chat-area-processing-dot"></div>
}

export default ChatArea;