import { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

export default function Scene({ modelPath }) {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef()
  const { camera } = useThree()
  const [modelInfo, setModelInfo] = useState({ size: [1, 1, 1] })

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    groupRef.current.position.set(-center.x, -center.y, -center.z)
    setModelInfo({ size: size.toArray() })

    const dist = maxDim * 1.8
    camera.position.set(dist, dist * 0.5, dist)
    camera.lookAt(0, 0, 0)
  }, [scene, camera])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <group ref={groupRef}>
        <primitive object={scene} />
      </group>

      <ContactShadows
        position={[0, -modelInfo.size[1] / 2, 0]}
        opacity={0.3}
        scale={Math.max(...modelInfo.size) * 2}
        blur={2}
        far={3}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.2}
        target={[0, 0, 0]}
      />
    </>
  )
}
