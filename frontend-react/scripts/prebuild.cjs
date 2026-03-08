const fs = require('fs')
const path = require('path')

const frontendDir = path.resolve(__dirname, '..', '..', 'frontend')

// Clean stale Vite assets
const assetsDir = path.join(frontendDir, 'assets')
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true })
  console.log('Cleaned stale assets')
}

// Remove old vanilla HTML files that shadow React routes on Vercel
const staleFiles = ['simulation.html', 'prompt-lab.html']
for (const file of staleFiles) {
  const filePath = path.join(frontendDir, file)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`Removed stale ${file}`)
  }
}
