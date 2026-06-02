const { createCanvas } = require('canvas')
const fs = require('fs')

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background circle
  ctx.fillStyle = '#607C8E'
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
  ctx.fill()

  // Inner circle
  ctx.fillStyle = '#4A6575'
  ctx.beginPath()
  ctx.arc(size/2, size/2, size * 0.38, 0, Math.PI * 2)
  ctx.fill()

  // CC text
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${size * 0.3}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CC', size/2, size/2)

  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'))
}

// Make sure icons dir exists
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons')
}

generateIcon(192, 'public/icons/icon-192.png')
generateIcon(512, 'public/icons/icon-512.png')
console.log('Icons generated!')
