import React from 'react'
import Time from '../time/time'
import Loading from '../lists/loading'

const LinkPreview = ({url, image, headline, datePublished, loading}) => {
  if (loading) {
    return (
      <div className='flex items-center justify-center bg-gray90 border border-gray80' style={{height: 126}} data-id='link-preview-loading' data-url={url}>
        <Loading />
      </div>
    )
  }

  if (!headline) {
    return null
  }

  const maxHeadlineLength = 76
  const text = headline.length > maxHeadlineLength ? headline.substring(0, maxHeadlineLength) + '…' : headline
  const height = 126
  const imgWidth = image ? (image.width ? image.width * (height / image.height) : 'auto') : 'auto'

  return (
    <a className='flex items-center bg-gray90 border border-gray80' style={{height, overflow: 'hidden'}} target='_blank' href={url} data-id='link-preview'>
      {image && image.url &&
        <img className='flex-none' style={{height, width: imgWidth}} src={image.url} />
      }
      <span className='flex-auto pt3 pb4 px4'>
        {datePublished &&
          <Time date={datePublished} className='f-sm gray20' style={{lineHeight: '18px'}}>
            {(mo) => mo.format('MMMM D, YYYY')}
          </Time>
        }
        <span className='block f-md semibold blue' style={{maxHeight: 48, lineHeight: '24px', overflow: 'hidden'}}>
          {text}
        </span>
        <span className='block f-sm gray20 truncate' style={{lineHeight: '24px'}}>{url}</span>
      </span>
    </a>
  )
}

export default LinkPreview
