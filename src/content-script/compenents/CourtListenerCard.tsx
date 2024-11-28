import { useState } from 'preact/hooks'
import { SearchIcon, CommentDiscussionIcon } from '@primer/octicons-react'
import ChatGPTQuery, { QueryStatus } from './ChatGPTQuery'

interface Props {
  question: string
  onStatusChange?: (status: QueryStatus) => void
}

function CourtListenerCard(props: Props) {
  const [mode, setMode] = useState<'none' | 'summary' | 'question'>('none')
  const { question } = props

  if (mode === 'summary') {
    return (
      <ChatGPTQuery
        question={question}
        onStatusChange={props.onStatusChange}
      />
    )
  }

  if (mode === 'question') {
    return (
      <>
        <div className="glarity--question-input">
          <input 
            type="text" 
            placeholder="Ask your question about this opinion..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const customQuestion = `Regarding this legal opinion, ${e.target.value}`
                setMode('summary')
                props.question = customQuestion
              }
            }}
          />
        </div>
      </>
    )
  }

  return (
    <div className="glarity--action-buttons">
      <a
        href="javascript:;"
        onClick={() => setMode('summary')}
      >
        <SearchIcon size="small" /> Summarize this opinion
      </a>
      <a
        href="javascript:;"
        onClick={() => setMode('question')}
      >
        <CommentDiscussionIcon size="small" /> Ask a question
      </a>
    </div>
  )
}

export default CourtListenerCard
