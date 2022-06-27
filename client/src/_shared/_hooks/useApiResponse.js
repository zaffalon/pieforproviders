import i18n from 'i18n'
import useApi from '_shared/_hooks/useApi'
import apiErrorHandler from '_utils/apiErrorHandler'
import useUnauthorizedHandler from '_shared/_hooks/useUnauthorizedHandler'

export const useApiResponse = () => {
  const { get, post, put, del } = useApi(
    useUnauthorizedHandler(),
    apiErrorHandler()
  )

  const makeRequest = async request => {
    const { type, url, data, headers: requestHeaders = {} } = request
    const proxyPrefixPlusUrl = '/api' + url

    const headers = {
      ...requestHeaders,
      Accept: 'application/vnd.pieforproviders.v1+json',
      'Content-Type': 'application/json',
      'Accept-Language': i18n.language
    }

    const result = (async () => {
      switch (type) {
        case 'post':
          return await post(proxyPrefixPlusUrl, data, headers)
        case 'put':
          return await put(proxyPrefixPlusUrl, data, headers)
        case 'del':
          return await del(proxyPrefixPlusUrl, headers)
        case 'get':
        default:
          return await get(proxyPrefixPlusUrl, headers)
      }
    })()
    return result
  }

  return {
    makeRequest: makeRequest
  }
}
