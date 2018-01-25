// Based on https://github.com/chemoish/videojs-bif/blob/c6fdc0c2cfc9446927062995b7e8830ae45fff0d/src/parser.js
import axios from 'axios'
import { fromByteArray } from 'base64-js'
import cdnRewrite from './cdnRewrite'

const BIF_INDEX_OFFSET = 64
const FRAMEWISE_SEPARATION_OFFSET = 16
const NUMBER_OF_BIF_IMAGES_OFFSET = 12
const BIF_INDEX_ENTRY_LENGTH = 8
const MAGIC_NUMBER = new Uint8Array([
  '0x89',
  '0x42',
  '0x49',
  '0x46',
  '0x0d',
  '0x0a',
  '0x1a',
  '0x0a'
])

function validate (magicNumber) {
  return MAGIC_NUMBER.every((byte, i) => magicNumber[i] === byte)
}

export default function bif (url) {
  return new Promise(async (resolve, reject) => {
    const {data: buf} = await axios.get(cdnRewrite(url), {
      responseType: 'arraybuffer'
    })

    const magicNumber = new Uint8Array(buf).slice(0, 8)
    if (!validate(magicNumber)) {
      return reject(new Error('Invalid BIF file'))
    }

    const data = new DataView(buf)
    const framewiseSeparation = data.getUint32(FRAMEWISE_SEPARATION_OFFSET, true) || 1000
    const numberOfBIFImages = data.getUint32(NUMBER_OF_BIF_IMAGES_OFFSET, true)

    const bifData = []
    for (let i = 0, bifIndexEntryOffset = BIF_INDEX_OFFSET; i < numberOfBIFImages; i += 1, bifIndexEntryOffset += BIF_INDEX_ENTRY_LENGTH) {
      const bifIndexEntryTimestampOffset = bifIndexEntryOffset
      const bifIndexEntryAbsoluteOffset = bifIndexEntryOffset + 4
      const nextBifIndexEntryAbsoluteOffset = bifIndexEntryAbsoluteOffset + BIF_INDEX_ENTRY_LENGTH

      const offset = data.getUint32(bifIndexEntryAbsoluteOffset, true)
      const nextOffset = data.getUint32(nextBifIndexEntryAbsoluteOffset, true)
      const length = nextOffset - offset

      bifData.push({
        time: ((data.getUint32(bifIndexEntryTimestampOffset, true) * framewiseSeparation) / 1000) - 15,
        url: `data:image/jpeg;base64,${fromByteArray(new Uint8Array(buf.slice(offset, offset + length)))}`
      })
    }

    resolve(bifData)
  })
}
