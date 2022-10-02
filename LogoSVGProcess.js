import * as THREE from './build/three.module.js';
import { SVGLoader } from './jsm/loaders/SVGLoader.js';
import * as globe from './Globe.js'

var shapes


function ExtrudeSVG (shapes, scale, position) {

    const extrudeSettings = {
        steps: 2,
        depth: 16,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 1
    };

    const geometry = new THREE.ExtrudeGeometry( shapes, extrudeSettings );
    const material = new THREE.MeshBasicMaterial( { color: 0x121212 } );
    const mesh = new THREE.Mesh( geometry, material ) ;
    mesh.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));
    mesh.scale.set(scale,scale,scale);
    mesh.position.set(position.x, position.y, position.z)
    globe.scene.add( mesh );

}


// instantiate a loader
const loader = new SVGLoader();

export function loadLogo(scale, position) {
    // load a SVG resource
    loader.load(
        // resource URL
        'https://iamtung-0000.github.io/OCG-Globe/Assets/LogoAsset-02.svg',

        // called when the resource is loaded
        function ( data ) {

            const paths = data.paths;

            for ( let i = 0; i < paths.length; i ++ ) {
                const path = paths[ i ];
                const material = new THREE.MeshBasicMaterial( {
                    color: path.color,
                    side: THREE.DoubleSide,
                    depthWrite: false
                } );
                shapes = SVGLoader.createShapes( path );
            }
            

            ExtrudeSVG(shapes,scale,position)

        },

    );
}
