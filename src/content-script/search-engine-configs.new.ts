import { queryParam } from 'gb-url'

export interface SearchEngine {
  inputQuery: string[]
  sidebarContainerQuery: string[]
  appendContainerQuery: string[]
  extabarContainerQuery?: string[]
  contentContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
  name?: string
  siteName: string
  siteValue: string
  regex: string
  searchRegExp?: string
}

export const config: Record<string, SearchEngine> = {
  courtlistener: {
    inputQuery: [],
    sidebarContainerQuery: ['.col-md-3'],
    appendContainerQuery: ['.col-md-9'],
    contentContainerQuery: ['[class="opinion-content"]'],
    siteName: 'CourtListener',
    siteValue: 'courtlistener',
    regex: '(^(www.)?courtlistener.com/opinion/)'
  }
}
