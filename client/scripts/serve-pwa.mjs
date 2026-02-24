import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const rootDir = resolve('dist/pwa')
const host = '127.0.0.1'
const port = Number(process.env.PORT || 9010)

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

const sendFile = async (res, filePath) => {
  const extension = extname(filePath).toLowerCase()
  res.statusCode = 200
  res.setHeader('Content-Type', mimeTypes[extension] || 'application/octet-stream')
  createReadStream(filePath).pipe(res)
}

const getRequestedPath = (requestUrl) => {
  const rawPath = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname)
  const normalized = normalize(rawPath).replace(/^(\.\.[/\\])+/, '')
  const requested = normalized === '/' ? '/index.html' : normalized
  return join(rootDir, requested)
}

const fileExists = async (filePath) => {
  try {
    const stats = await stat(filePath)
    return stats.isFile()
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  try {
    const requestedPath = getRequestedPath(req.url || '/')
    const safePath = requestedPath.startsWith(rootDir) ? requestedPath : join(rootDir, 'index.html')

    if (await fileExists(safePath)) {
      await sendFile(res, safePath)
      return
    }

    const fallback = join(rootDir, 'index.html')
    if (await fileExists(fallback)) {
      await sendFile(res, fallback)
      return
    }

    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('dist/pwa not found. Run "npm run build:pwa" first.')
  } catch {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Internal server error')
  }
})

server.listen(port, host, () => {
  console.log(`PWA server running at http://${host}:${port}`)
  console.log('Press Ctrl+C to stop.')
})

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    const alternativePort = port + 1
    console.error(`Port ${port} is already in use. Use another one, e.g. PowerShell: $env:PORT='${alternativePort}'; npm run serve:pwa`)
  } else {
    console.error('Server failed to start.', error)
  }
  process.exit(1)
})
