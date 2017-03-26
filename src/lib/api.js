import axios from 'axios'

export const ACCESS_TOKEN = 'vdsWT3hI0V99etr'
export const DEVICE_TYPE = 'com.crunchyroll.iphone'
export const LOCALE = 'enUS'
export const VERSION = '3004.1'
export const UMI_SERVER = process.env.NODE_ENV === 'production' ? 'https://umi-watch-api.now.sh' : 'http://localhost:3001'

export default function api (opts) {
  const config = {
    method: opts.method || 'get',
    url: `https://api.crunchyroll.com/${opts.route}.0.json`,
    params: !opts.data ? Object.assign({}, opts.params, {
      locale: LOCALE,
      version: VERSION
    }) : null,
    data: opts.data
  }

  return axios(config)
}
