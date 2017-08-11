import {
  Serialize,
  addUrlProps,
  UrlQueryParamTypes
} from 'react-url-query'

const commaSeperatedArrayType = {
  encode: (val) => Serialize.encodeArray(val, ','),
  decode: (val) => Serialize.decodeArray(val, ',')
}

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
    type: commaSeperatedArrayType,
    queryParam: 'campaign'
  },
  tagSlugs: {
    type: commaSeperatedArrayType,
    queryParam: 'tag'
  },
  importId: {
    type: UrlQueryParamTypes.string
  }
}

export default function createSearchQueryContainer (Component) {
  return addUrlProps({urlPropsQueryConfig})(Component)
}
