import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const ONEDRIVE_BASE = 'C:\\Users\\GECA\\OneDrive - UNIVERSIDAD PRIVADA DE TACNA\\SGC_UPT_EVIDENCIAS\\2026'

function resolveTargetActivityDir(organUnitPath: string, procedureCode: string, step: number): string {
  const unitDir = path.join(ONEDRIVE_BASE, ...organUnitPath.split('/'))
  fs.mkdirSync(unitDir, { recursive: true })

  // Buscar carpeta existente que empiece con `${procedureCode}`
  const unitEntries = fs.readdirSync(unitDir, { withFileTypes: true })
  const existingProc = unitEntries.find(
    (d) => d.isDirectory() && d.name.toUpperCase().startsWith(procedureCode.toUpperCase())
  )
  const procDir = existingProc ? path.join(unitDir, existingProc.name) : path.join(unitDir, procedureCode)
  fs.mkdirSync(procDir, { recursive: true })

  // Buscar carpeta existente que empiece con `Act_XX`
  const stepPrefix = `Act_${String(step).padStart(2, '0')}`
  const procEntries = fs.readdirSync(procDir, { withFileTypes: true })
  const existingAct = procEntries.find(
    (d) => d.isDirectory() && d.name.toUpperCase().startsWith(stepPrefix.toUpperCase())
  )
  const actDir = existingAct ? path.join(procDir, existingAct.name) : path.join(procDir, stepPrefix)
  fs.mkdirSync(actDir, { recursive: true })

  return actDir
}

function onedriveSyncPlugin(): Plugin {
  return {
    name: 'sgc-onedrive-sync-plugin',
    configureServer(server) {
      server.middlewares.use('/api/onedrive-sync', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const payload = JSON.parse(body)
              const { action, organUnitPath, procedureCode, step, fileName, dataUrl } = payload
              if (!organUnitPath || !procedureCode || !step || !fileName) {
                res.statusCode = 400
                res.end(JSON.stringify({ ok: false, error: 'Missing required fields' }))
                return
              }

              const actDir = resolveTargetActivityDir(organUnitPath, procedureCode, Number(step))
              const safeFileName = path.basename(fileName).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
              const fullFilePath = path.join(actDir, safeFileName)

              if (action === 'delete') {
                if (fs.existsSync(fullFilePath)) {
                  fs.unlinkSync(fullFilePath)
                }
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true, deleted: fullFilePath }))
                return
              }

              if (dataUrl && typeof dataUrl === 'string') {
                const base64Match = dataUrl.match(/^data:[^;]+;base64,(.+)$/)
                const base64Data = base64Match ? base64Match[1] : dataUrl
                const buffer = Buffer.from(base64Data, 'base64')
                fs.writeFileSync(fullFilePath, buffer)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: true, savedPath: fullFilePath }))
                return
              }

              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: 'Invalid dataUrl' }))
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, error: err?.message || 'Error writing to OneDrive' }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    onedriveSyncPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
