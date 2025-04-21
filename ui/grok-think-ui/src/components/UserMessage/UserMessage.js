import React from 'react'
import './UserMessage.css'
import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm'

const UserMessage = ({message}) => {
	return (
		<div className="user-message-container">
			<div className="user-message">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
			</div>
		</div>
		);
}

export default UserMessage;