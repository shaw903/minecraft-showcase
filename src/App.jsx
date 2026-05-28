import { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

/* ── auto-detect all .glb files in public/models/ ── */
const modelFiles = import.meta.glob('/public/models/*.glb')

const MODELS = Object.keys(modelFiles)
  .map((filePath) => {
    const fileName = filePath.split('/').pop()
    const name = fileName.replace('.glb', '')
    return { id: name, label: name, path: '/models/' + fileName }
  })
  .sort((a, b) => a.label.localeCompare(b.label, 'zh'))

if (MODELS.length === 0) {
  MODELS.push({ id: 'placeholder', label: 'No models', path: '' })
}

/* ── known metadata (fallback to filename) ── */
const KNOWN = {
  '学校1': { zh: '学校',   en: 'School',            desc: '三层教育建筑，教室、实验室与礼堂。石英立柱与深板岩墙体。' },
  '商住1': { zh: '商住楼', en: 'Commercial Complex', desc: '商住两用综合体，底层商铺与上层住宅联动布局。' },
  '公园1': { zh: '公园',   en: 'Community Park',     desc: '社区公园绿地，步道环绕，植被层叠营造生态微气候。' },
  '公园2': { zh: '花园',   en: 'Garden Plaza',       desc: '花园广场，水景与凉亭错落布局，开放式休闲空间。' },
  '医院':   { zh: '医院',   en: 'Medical Center',     desc: '多层医疗建筑，诊疗区与住院部功能分区明确。' },
}

function getInfo(id) {
  return KNOWN[id] ?? {
    zh: id,
    en: id,
    desc: 'Minecraft 建筑作品',
  }
}

/* ── loading ── */
function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
      <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )
}

/* ── app ── */
export default function App() {
  const [current, setCurrent] = useState(MODELS[0])
  const [fading, setFading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  const switchModel = useCallback(
    (model) => {
      if (model.id === current.id || fading) return
      setFading(true)
      setTimeout(() => {
        setCurrent(model)
        setTimeout(() => setFading(false), 120)
      }, 300)
    },
    [current.id, fading],
  )

  const info = getInfo(current.id)
  const currentIndex = MODELS.findIndex((m) => m.id === current.id)

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden select-none font-sans">
      {/* ── background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#050505] to-[#000000]" />

      {/* ── top: centered logo ── */}
      <header
        className={`fixed top-0 inset-x-0 z-20 flex justify-center py-6
                    transition-all duration-1000 ease-out
                    ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <span className="text-[13px] font-light tracking-[0.35em] text-white/35">
          MC STUDIO
        </span>
      </header>

      {/* ── left: model switcher ── */}
      <nav
        className={`fixed left-6 md:left-8 top-1/2 -translate-y-1/2 z-10
                    flex flex-col gap-4
                    transition-all duration-1000 ease-out delay-150
                    ${ready ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
      >
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => switchModel(m)}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <span
              className={`block rounded-full transition-all duration-500 ease-out
                ${current.id === m.id
                  ? 'w-2 h-2 bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                  : 'w-1.5 h-1.5 bg-white/20 group-hover:bg-white/40'
                }`}
            />
            <span
              className={`text-[11px] md:text-xs font-light tracking-[0.08em] transition-all duration-500
                ${current.id === m.id
                  ? 'text-white/80'
                  : 'text-white/25 group-hover:text-white/50'
                }`}
            >
              {m.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── 3D canvas ── */}
      <div
        className={`h-full transition-opacity duration-500 ease-out
          ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <Suspense fallback={<Loading />}>
          <Canvas key={current.id}>
            <Scene modelPath={current.path} />
          </Canvas>
        </Suspense>
      </div>

      {/* ── bottom: product card ── */}
      <div
        className={`fixed bottom-0 inset-x-0 z-10
                    flex flex-col items-center pb-7 md:pb-10
                    transition-all duration-1000 ease-out delay-300
                    ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <h2 className="text-xl md:text-2xl font-light tracking-[0.06em] text-white/90">
            {info.zh}
          </h2>
          <p className="text-[11px] md:text-xs font-light tracking-[0.1em] text-white/30 uppercase">
            {info.en}
          </p>
          <p className="text-[12px] md:text-[13px] font-light leading-relaxed text-white/35 max-w-sm mt-1">
            {info.desc}
          </p>
          <p className="text-[10px] tracking-[0.08em] text-white/15 mt-2">
            Designed by{' '}
            <span className="text-white/25 font-normal">shaw</span>
          </p>
        </div>

        {/* ── dot indicators ── */}
        <div className="flex items-center gap-3 mt-5">
          {MODELS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => switchModel(m)}
              className={`rounded-full transition-all duration-500 ease-out cursor-pointer
                ${i === currentIndex
                  ? 'w-1.5 h-1.5 bg-white/80'
                  : 'w-1 h-1 bg-white/20 hover:bg-white/35'
                }`}
            />
          ))}
        </div>
      </div>

      {/* ── corner hints ── */}
      <div
        className={`fixed bottom-8 right-6 z-10
                    flex flex-col gap-2 text-right
                    text-white/15 text-[10px] tracking-[0.08em] leading-relaxed
                    transition-all duration-1000 ease-out delay-500
                    ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        <span>拖拽旋转</span>
        <span>滚轮缩放</span>
      </div>
    </div>
  )
}
