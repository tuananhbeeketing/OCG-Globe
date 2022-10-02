import * as globe from './Globe.js'
import * as param from './Param.js'
import * as THREE from './build/three.module.js';


export function Curves (p1, p2, geometry, mesh) {

    this.geometry = geometry
    this.mesh = mesh

    this.p1 = p1
    this.p2 = p2
    this.getCurve = getCurve;

    
}

export function getCurve() {

    let v1 = new THREE.Vector3(this.p1.x, this.p1.y , this.p1.z);
    let v2 = new THREE.Vector3(this.p2.x, this.p2.y, this.p2.z);
    let pointCount = 64;

    let points = []

    for (let i = 0; i < pointCount; i++) {
        let p = new THREE.Vector3().lerpVectors(v1, v2, ( i/pointCount ));
        p.normalize()
        p.multiplyScalar(param.globeRadius)
        p.multiplyScalar(1 + 0.2 * Math.sin(Math.PI*i/pointCount))
        points.push(p)
    }

    let path = new THREE.CatmullRomCurve3(points);

    const samples = path.getPoints( points.length * pointCount );

    this.geometry = new THREE.TubeBufferGeometry( path, 128, param.strokeSize, 8, false );

    const material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Line ( this.geometry, material );


    globe.scene.add( this.mesh )


}