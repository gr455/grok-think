import React from 'react'
import './SystemMessage.css'
import ThinkBox from '../ThinkBox/ThinkBox.js'

const SystemMessage = ({thought, message, thoughtFor, error, state}) => {
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
				<div className="system-message-messagebox">{message}</div>
			</div>
		</div>
		)
}

export default SystemMessage;