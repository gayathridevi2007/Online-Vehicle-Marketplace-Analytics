import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { ImagePlus, RotateCcw } from 'lucide-react'

const CROP_SIZE = 512
const MAX_SOURCE_SIZE = 8 * 1024 * 1024

const ProfileImageCropper = forwardRef(function ProfileImageCropper(_props, ref) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const dragRef = useRef(null)
  const panRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(1)
  const objectUrlRef = useRef(null)
  const previewRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [error, setError] = useState('')

  function drawCrop(image, currentZoom, currentPan) {
    const canvas = canvasRef.current
    if (!canvas) return null
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE
    const context = canvas.getContext('2d')
    const scale = Math.max(
      CROP_SIZE / image.naturalWidth,
      CROP_SIZE / image.naturalHeight,
    ) * currentZoom
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    context.clearRect(0, 0, CROP_SIZE, CROP_SIZE)
    context.fillStyle = '#0a111d'
    context.fillRect(0, 0, CROP_SIZE, CROP_SIZE)
    context.drawImage(
      image,
      (CROP_SIZE - width) / 2 + currentPan.x,
      (CROP_SIZE - height) / 2 + currentPan.y,
      width,
      height,
    )
    const cropped = canvas.toDataURL('image/jpeg', 0.9)
    previewRef.current = cropped
    setPreview(cropped)
    return cropped
  }

  useImperativeHandle(ref, () => ({
    getImage: () => previewRef.current,
  }), [])

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP profile image.')
      return
    }
    if (file.size > MAX_SOURCE_SIZE) {
      setError('Choose an image smaller than 8 MB.')
      return
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    const image = new Image()
    image.onload = () => {
      imageRef.current = image
      panRef.current = { x: 0, y: 0 }
      zoomRef.current = 1
      setPan(panRef.current)
      setZoom(1)
      setFileName(file.name)
      setError('')
      drawCrop(image, 1, panRef.current)
    }
    image.onerror = () => setError('This image could not be opened.')
    image.src = objectUrl
  }

  function handleZoom(event) {
    const nextZoom = Number(event.target.value)
    zoomRef.current = nextZoom
    setZoom(nextZoom)
    if (imageRef.current) {
      drawCrop(imageRef.current, nextZoom, panRef.current)
    }
  }

  function handlePointerDown(event) {
    if (!imageRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      pan: panRef.current,
    }
  }

  function handlePointerMove(event) {
    if (!dragRef.current || !imageRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const scale = CROP_SIZE / rect.width
    const imageScale = Math.max(
      CROP_SIZE / imageRef.current.naturalWidth,
      CROP_SIZE / imageRef.current.naturalHeight,
    ) * zoomRef.current
    const maxX = Math.max(
      0,
      (imageRef.current.naturalWidth * imageScale - CROP_SIZE) / 2,
    )
    const maxY = Math.max(
      0,
      (imageRef.current.naturalHeight * imageScale - CROP_SIZE) / 2,
    )
    const nextPan = {
      x: Math.max(-maxX, Math.min(
        maxX,
        dragRef.current.pan.x + (event.clientX - dragRef.current.x) * scale,
      )),
      y: Math.max(-maxY, Math.min(
        maxY,
        dragRef.current.pan.y + (event.clientY - dragRef.current.y) * scale,
      )),
    }
    panRef.current = nextPan
    setPan(nextPan)
    drawCrop(imageRef.current, zoomRef.current, nextPan)
  }

  function handlePointerEnd() {
    dragRef.current = null
  }

  function resetCrop() {
    if (!imageRef.current) return
    const centered = { x: 0, y: 0 }
    panRef.current = centered
    zoomRef.current = 1
    setPan(centered)
    setZoom(1)
    drawCrop(imageRef.current, 1, centered)
  }

  return (
    <div className="profile-cropper">
      <div className="profile-cropper-preview-row">
        <div>
          <span className="account-field-label">1:1 profile crop</span>
          <canvas
            aria-label="Square crop preview. Drag to reposition the image."
            className={`profile-crop-canvas${imageRef.current ? ' is-ready' : ''}`}
            onLostPointerCapture={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            ref={canvasRef}
            role="img"
          />
          <small className="profile-crop-hint">Drag to reposition · scroll not required</small>
        </div>
        <div className="profile-crop-output">
          <span className="account-field-label">Saved preview</span>
          {preview
            ? <img alt="Cropped profile preview" src={preview} />
            : <span className="profile-crop-empty"><ImagePlus aria-hidden="true" size={25} /></span>}
        </div>
      </div>

      <div className="profile-crop-controls">
        <label className="profile-zoom-control">
          <span>Zoom</span>
          <input
            aria-label="Profile image zoom"
            disabled={!preview}
            max="3"
            min="1"
            onChange={handleZoom}
            step="0.05"
            type="range"
            value={zoom}
          />
          <small>{zoom.toFixed(1)}×</small>
        </label>
        <button
          className="profile-crop-reset"
          disabled={!preview || (zoom === 1 && pan.x === 0 && pan.y === 0)}
          onClick={resetCrop}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={14} />
          Reset crop
        </button>
      </div>

      <label className="account-image-upload">
        <ImagePlus aria-hidden="true" size={15} />
        {fileName || 'Choose a profile image'}
        <input
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          type="file"
        />
      </label>
      {error && <span className="account-form-error" role="alert">{error}</span>}
    </div>
  )
})

export default ProfileImageCropper
