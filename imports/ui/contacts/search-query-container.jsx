import { UrlQueryParamTypes, addUrlProps } from 'react-url-query'

const urlPropsQueryConfig = {
  sort: {
    type: UrlQueryParamTypes.json
  },
  term: {
    type: UrlQueryParamTypes.string,
    queryParam: 'q'
  },
  masterListSlug: {
    type: UrlQueryParamTypes.string,
    queryParam: 'list'
  },
  userId: {
    type: UrlQueryParamTypes.string,
    queryParam: 'my'
  },
  campaignSlugs: {
    type: UrlQueryParamTypes.array,
    queryParam: 'campaign'
  },
  tagSlugs: {
    type: UrlQueryParamTypes.array,
    queryParam: 'tag'
  },
  importId: {
    type: UrlQueryParamTypes.string
  }
}

export default function createSearchQueryContainer (Component) {
  return addUrlProps({urlPropsQueryConfig})(Component)
}
