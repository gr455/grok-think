import React from 'react'
import './UserMessage.css'

const UserMessage = ({message}) => {
	return (
		<div className="user-message-container">
			<div className="user-message">
				{message}
			</div>
		</div>
		);
}

export default UserMessage;