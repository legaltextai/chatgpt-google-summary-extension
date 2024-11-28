import { useState, useCallback, useEffect, useMemo } from 'react'
import { Spinner, GeistProvider, Loading } from '@geist-ui/core'
import { GearIcon, SyncIcon } from '@primer/octicons-react'
import Browser from 'webextension-polyfill'
import { SearchEngine } from '@/content-script/search-engine-configs'
import { TriggerMode, Theme, getUserConfig } from '@/config'
import { QueryStatus } from './ChatGPTQuery'
import { detectSystemColorScheme } from '@/utils/utils'
import getQuestion from '@/content-script/compenents/GetQuestion'
import CourtListenerCard from './CourtListenerCard'
import logo from '@/assets/img/logo-48.png'

interface Props {
  question: string | null
  triggerMode: TriggerMode
  siteConfig: SearchEngine
}

function ChatGPTContainer(props: Props) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(Theme.Auto)
  const [questionData, setQuestionData] = useState<Props>({ ...props })

  const themeType = useMemo(() => {
    return theme === Theme.Auto ? detectSystemColorScheme() : theme
  }, [theme])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const onRefresh = useCallback(async () => {
    if (loading) return
    setLoading(true)
    const newQuestionData = await getQuestion()
    if (newQuestionData) {
      setQuestionData({ ...props, ...newQuestionData })
    }
    setLoading(false)
  }, [props, loading])

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.theme))
  }, [])

  return (
    <div className="glarity--container">
      <GeistProvider themeType={themeType}>
        <div className="glarity--chatgpt">
          <div className="glarity--header">
            <div>
              <span className="glarity--header__logo">
                <img src={logo} alt="Court Assistant" />
                Court Opinion Assistant
              </span>
              <a href="javascript:;" className="glarity--header__logo" onClick={openOptionsPage}>
                <GearIcon size={14} />
              </a>
              {loading ? (
                <span className="glarity--header__logo">
                  <Spinner className="glarity--icon--loading" />
                </span>
              ) : (
                <a href="javascript:;" className="glarity--header__logo" onClick={onRefresh}>
                  <SyncIcon size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="glarity--main">
            <div className="glarity--main__container">
              {loading && (
                <div className="glarity--main__loading">
                  <Loading />
                </div>
              )}
              {questionData.question ? (
                <CourtListenerCard
                  question={questionData.question}
                  onStatusChange={setQueryStatus}
                />
              ) : (
                <p>Loading court opinion...</p>
              )}
            </div>
          </div>
        </div>
      </GeistProvider>
    </div>
  )
}

export default ChatGPTContainer
