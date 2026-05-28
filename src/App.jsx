import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

/* ── auto-detect models ── */
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

/* ── photos ── */
const KNOWN_PHOTOS = [
  '101710x.jpg',
  '3141.png',
  '3142.png',
  '3153.png',
  '683.PNG',
  '9203.png',
  'yishi.png',
]

const PHOTOS = KNOWN_PHOTOS.map((name) => '/models/' + name)

/* ── known metadata ── */
const KNOWN = {
  '学校1':   { zh: '学校',   en: 'School',            desc: '三层教育建筑，教室、实验室与礼堂。石英立柱与深板岩墙体。' },
  '商住1':   { zh: '商住楼', en: 'Commercial Complex', desc: '商住两用综合体，底层商铺与上层住宅联动布局。' },
  '公园1':   { zh: '公园',   en: 'Community Park',     desc: '社区公园绿地，步道环绕，植被层叠营造生态微气候。' },
  '公园2':   { zh: '花园',   en: 'Garden Plaza',       desc: '花园广场，水景与凉亭错落布局，开放式休闲空间。' },
  '写字楼1': { zh: '写字楼', en: 'Office Tower',       desc: '高层办公建筑，玻璃幕墙与钢结构框架现代风格。' },
}

function getInfo(id) {
  return KNOWN[id] ?? { zh: id, en: id, desc: 'Minecraft 建筑作品' }
}

/* ── loading ── */
function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
      <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )
}

/* ── photo gallery ── */
function PhotoGallery() {
  const scrollRef = useRef(null)
  const dragRef = useRef({ down: false, startX: 0, scrollLeft: 0 })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    const onDown = (e) => {
      dragRef.current = {
        down: true,
        startX: (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft,
        scrollLeft: el.scrollLeft,
      }
      el.style.cursor = 'grabbing'
    }

    const onMove = (e) => {
      if (!dragRef.current.down) return
      e.preventDefault()
      const x = (e.touches ? e.touches[0].pageX : e.pageX) - el.offsetLeft
      const walk = (x - dragRef.current.startX) * 2
      el.scrollLeft = dragRef.current.scrollLeft - walk
    }

    const onUp = () => {
      dragRef.current.down = false
      el.style.cursor = 'grab'
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onDown)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('touchstart', onDown, { passive: false })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onUp)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="absolute inset-0 overflow-x-auto overflow-y-hidden
                  flex items-center gap-8 md:gap-12 px-8 md:px-20
                  snap-x snap-mandatory scrollbar-none
                  cursor-grab select-none"
    >
      {PHOTOS.map((src, i) => (
        <div key={src} className="snap-center shrink-0 flex flex-col items-center gap-4">
          <img
            src={src}
            alt=""
            draggable="false"
            className="h-[55vh] md:h-[72vh] w-auto max-w-[88vw] object-contain
                       rounded-xl pointer-events-none"
          />
          <span className="text-[10px] tracking-[0.12em] text-white/20">
            {String(i + 1).padStart(2, '0')} / {PHOTOS.length}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── app ── */
export default function App() {
  const [current, setCurrent] = useState(MODELS[0])
  const [fading, setFading] = useState(false)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState('model') // 'model' | 'photo'

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
  const isModel = view === 'model'

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden select-none font-sans">
      {/* ── background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#050505] to-[#000000]" />

      {/* ── top: toggle ── */}
      <header
        className={`fixed top-0 inset-x-0 z-20 flex justify-center py-6
                    transition-all duration-1000 ease-out
                    ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div className="flex items-center rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-0.5">
          <button
            onClick={() => setView('model')}
            className={`px-5 py-1.5 rounded-full text-[11px] md:text-xs font-light tracking-[0.06em]
                        transition-all duration-300 ease-out
                        ${isModel
                          ? 'bg-white/[0.08] text-white/90'
                          : 'text-white/25 hover:text-white/50'
                        }`}
          >
            模型
          </button>
          <button
            onClick={() => setView('photo')}
            className={`px-5 py-1.5 rounded-full text-[11px] md:text-xs font-light tracking-[0.06em]
                        transition-all duration-300 ease-out
                        ${!isModel
                          ? 'bg-white/[0.08] text-white/90'
                          : 'text-white/25 hover:text-white/50'
                        }`}
          >
            照片
          </button>
        </div>
      </header>

      {/* ── left: model switcher (only in model view) ── */}
      {isModel && (
        <nav
          className={`fixed left-6 md:left-8 top-1/2 -translate-y-1/2 z-10
                      flex flex-col gap-4
                      transition-all duration-700 ease-out delay-150
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
      )}

      {/* ── content area ── */}
      <div className="absolute inset-0">
        {isModel ? (
          <Suspense fallback={<Loading />}>
            <Canvas key={current.id}>
              <Scene modelPath={current.path} />
            </Canvas>
          </Suspense>
        ) : (
          <PhotoGallery />
        )}
      </div>

      {/* ── bottom card (model view only) ── */}
      {isModel && (
        <div
          className={`fixed bottom-0 inset-x-0 z-10
                      flex flex-col items-center pb-7 md:pb-10
                      transition-all duration-700 ease-out delay-300
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
      )}

      {/* ── corner hints ── */}
      <div
        className={`fixed bottom-8 right-6 z-10
                    flex flex-col gap-2 text-right
                    text-white/15 text-[10px] tracking-[0.08em] leading-relaxed
                    transition-all duration-700 ease-out delay-500
                    ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        {isModel ? (
          <>
            <span>拖拽旋转</span>
            <span>滚轮缩放</span>
          </>
        ) : (
          <>
            <span>滚轮滑动</span>
            <span>左右浏览</span>
          </>
        )}
      </div>
    </div>
  )
}
