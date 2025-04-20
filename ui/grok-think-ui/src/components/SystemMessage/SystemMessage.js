import React from 'react'
import './SystemMessage.css'

const SystemMessage = ({thought, message, thoughtFor, error}) => {
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
				<div className="system-message-thinkbox">{thought}</div>
				<div className="system-message-messagebox">{message}</div>
			</div>
		</div>
		)
}

export default SystemMessage;