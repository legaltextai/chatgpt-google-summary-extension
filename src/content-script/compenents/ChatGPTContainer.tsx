import { useState, useCallback, useEffect, useMemo } from 'react'
import { Spinner, GeistProvider, Loading, Divider } from '@geist-ui/core'
import { SearchIcon } from '@primer/octicons-react'
import Browser from 'webextension-polyfill'
// import useSWRImmutable from 'swr/immutable'
import { SearchEngine } from '@/content-script/search-engine-configs'
import { TriggerMode, Theme, getUserConfig, APP_TITLE } from '@/config'
import CourtListenerCard from './CourtListenerCard'
import { QueryStatus } from './ChatGPTQuery'
import { detectSystemColorScheme } from '@/utils/utils'
import { GearIcon, SyncIcon } from '@primer/octicons-react'
import { queryParam } from 'gb-url'
import getQuestion from '@/content-script/compenents/GetQuestion'
import logo from '@/assets/img/logo-48.png'

interface Props {
  question: string | null
  transcript?: unknown
  triggerMode: TriggerMode
  siteConfig: SearchEngine
  langOptionsWithLink?: unknown
  currentTime?: number
}

function ChatGPTContainer(props: Props) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(Theme.Auto)
  const [questionData, setQuestionData] = useState<Props>({ ...props })

  const themeType = useMemo(() => {
    if (theme === Theme.Auto) {
      return detectSystemColorScheme()
    }
    return theme
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

    setQueryStatus(undefined)
  }, [props, loading])

  const onPlay = useCallback(async (starttime = 0) => {
    const videoElm = document.querySelector(
      '#movie_player > div.html5-video-container > video',
    ) as HTMLVideoElement
    if (!videoElm) {
      return
    }

    videoElm.currentTime = starttime
    videoElm.play()
  }, [])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [copied])

  useEffect(() => {
    setQuestionProps({ ...props })

    if (props.transcript) {
      setCurrentTranscript([...props.transcript])
    }
  }, [props])

  useEffect(() => {
    if (queryStatus) {
      setLoading(false)
    }
  }, [queryStatus])

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.theme))
  }, [])

  const switchtranscriptShow = () => {
    setTranscriptShow((state) => !state)
  }

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
                {questionProps.question ? (
                  <>
                    {triggerMode === TriggerMode.Manually && !questionProps.currentTime ? (
                      <span
                        className="glarity--link"
                        onClick={() => {
                          onRefresh()
                        }}
                      >
                        <a>
                          <SearchIcon size="small" /> Ask ChatGPT to summarize
                        </a>
                      </span>
                    ) : (
                      <>
                        {loading && (
                          <div className="glarity--main__loading">
                            <Loading />
                          </div>
                        )}
                        <ChatGPTCard
                          question={questionProps.question}
                          triggerMode={questionProps.triggerMode}
                          onStatusChange={setQueryStatus}
                          currentTime={questionProps.currentTime}
                        />
                      </>
                    )}
                  </>
                ) : questionProps.siteConfig?.name === 'youtube' ? (
                  <>
                    <p>No Transcription Available... </p>
                    <p>
                      Try{' '}
                      <a
                        href="https://huggingface.co/spaces/jeffistyping/Youtube-Whisperer"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Youtube Whisperer
                      </a>{' '}
                      to transcribe!
                    </p>
                  </>
                ) : (
                  <p>
                    <AlertIcon size={14} /> No results.
                  </p>
                )}
              </div>
            </div>

            {questionProps.question && currentTranscript && (
              <div className="glarity--main">
                <div className="glarity--main__header">
                  <div className="glarity--main__header--title">
                    Transcript
                    {questionProps.langOptionsWithLink.length > 1 && (
                      <>
                        {' '}
                        <select
                          className="glarity--select"
                          value={selectedOption}
                          onChange={handleChange}
                        >
                          {questionProps.langOptionsWithLink &&
                            Array.from(questionProps.langOptionsWithLink).map((v, i) => {
                              return (
                                <option key={i} value={i}>
                                  {v.language}
                                </option>
                              )
                            })}
                        </select>
                      </>
                    )}
                  </div>
                  <div className="glarity--main__header--action">
                    <a href="javascript:;" onClick={copytSubtitle}>
                      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </a>

                    <a href="javascript:;" onClick={switchtranscriptShow}>
                      {transcriptShow ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                    </a>
                  </div>
                </div>

                <div
                  className="glarity--main__container glarity--main__container--subtitle"
                  style={{
                    display: transcriptShow ? 'block' : 'none',
                  }}
                >
                  {currentTranscript.map((v, i) => {
                    const { time, text } = v

                    return (
                      <div className="glarity--subtitle" key={i}>
                        <div
                          className="subtitle--time"
                          onClick={() => {
                            onPlay(v.start || 0)
                          }}
                        >
                          {time}
                        </div>
                        <div
                          className="subtitle--text"
                          dangerouslySetInnerHTML={{ __html: text }}
                        ></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      </GeistProvider>
    </>
  )
}

export default ChatGPTContainer
