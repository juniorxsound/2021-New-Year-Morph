import {
    editable as e,
    RefreshSnapshot,
    SheetProvider,
} from '@theatre/r3f';
import { Stars } from '@react-three/drei';
import { getProject } from '@theatre/core';
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei/core/useGLTF';
import studio from '@theatre/studio';
import { styled } from 'pretty-lights';

import state from './animation.json';

import './App.css';

studio.initialize();

const CanvasContainer = styled('div')`
    pading: 0;
    margin: none;
`;

function Model({ url, sheet }) {
    // @ts-ignore
    const { nodes } = useGLTF(url);

    // Since we are turning a Mesh to points decleratively keep track of the morph targets
    const [morphTargetDictionary, setMorphTargetDictionary] = useState();

    const pointsRef = useRef();

    // The influence between
    const [morph, setMorph] = useState(0.0);
    const [yRot, setYRot] = useState(0.0);

    useEffect(() => {
        if (nodes) setMorphTargetDictionary(nodes.model.morphTargetDictionary);

        // Register the theathre values
        sheet.object('Model Morph', {
            rotation: 0,
            morph: 0
        }).onValuesChange(newVal => {
            setMorph(newVal.morph);
            setYRot(newVal.rotation);
        });
    }, [nodes]);

    useEffect(() => {
        if (sheet) {
            sheet.sequence.loop = true;
            sheet.sequence.play();
        }
    }, [sheet]);

    useEffect(() => {
        if (pointsRef.current) {
            pointsRef.current.material.size = 0.2;
        }
    }, [pointsRef]);


    return (nodes &&
        <points ref={pointsRef} size={0.2} rotation={[0, yRot, 0]} morphTargetInfluences={[morph]} morphTargetDictionary={morphTargetDictionary} geometry={nodes.model.geometry} />
    )
}

function App() {
    const [sheet, setSheet] = useState(null);

    return (
        <CanvasContainer>
            <Canvas dpr={[1.5, 2]} frameloop="demand">
                <SheetProvider getSheet={() => {
                    const sheetProv = getProject('2021 EOY', { state }).sheet('Scene');
                    setSheet(sheetProv);
                    return sheetProv;
                }}>
                    <e.perspectiveCamera
                        uniqueName="Camera"
                        // @ts-ignore
                        makeDefault
                        position={[0, -60, -120]}
                        fov={75}
                    >
                        {/* <color attach="background" args={"black"} /> */}
                        <Stars radius={500} depth={100} count={10000} factor={10} />
                        <Suspense fallback={null}>
                            <RefreshSnapshot />
                            <Model sheet={sheet} url={'models/morph_tree.glb'} />
                        </Suspense>

                    </e.perspectiveCamera>
                    <color attach="background" args={["black"]} />
                </SheetProvider>
            </Canvas>
        </CanvasContainer>
    )
}

export default App