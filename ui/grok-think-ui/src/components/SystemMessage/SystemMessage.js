import React from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import './SystemMessage.css'
import ThinkBox from '../ThinkBox/ThinkBox.js'

const SystemMessage = ({thought, message, thoughtFor, error, aborted = false, state}) => {
	if (error) {
		return (
			<div className="system-message-container">
			<div className="system-message">
				<div className="system-message-errorbox">{error}</div>
			</div>
		</div>
			)
	}
	return (
		<div className="system-message-container">
			<div className="system-message">
				<ThinkBox thought={thought} thoughtFor={thoughtFor} state={state} />
				<div className="system-message-messagebox"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown></div>
				{aborted && <div className="system-message-aborted">Response aborted by user</div>}
			</div>
		</div>
		)
}

export default SystemMessage;