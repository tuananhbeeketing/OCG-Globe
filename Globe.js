/*

ThreeJS Globe Animation for OCG Website
Author: IamTung
email: iamtung.asia@gmailcom

*/

import * as THREE from './build/three.module.js';
import Stats from './jsm/libs/stats.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

import * as glow from './build/threex.atmospherematerial.js';



import * as param from './Param.js'
import * as country from './Country.js'
import * as curve from './Curve.js'
import * as svg from './LogoSVGProcess.js'


export let camera, controls, scene, renderer;
export let cube;
export let material;
export let stats, container;
export let latitude, longitude;

let VietNam,American,China,Belarus,Cameroon,Argentina, Canada
var VN_US, VN_CH, VN_BR, VN_CR, VN_AR, VN_CA


var shapes

let icr = 0
let renderDefer
let renderDefering = false

const objects = [];


function createStatsGUI() {

    var thisParent;

    //Create new Graph (FPS, MS, MB)
    let stats1 = new Stats();

    //Display different panel
    stats1.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats1.domElement.style.width = '400px';
    stats1.domElement.style.height = '400px';

    //Add Stats to Document - modal 4
    thisParent.appendChild( stats1.domElement );
}

const aboutGlobe = document.getElementById("aboutGlobe");



const TransformMatrix = function () {

    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    return function ( matrix ) {

        const cubePos = lglt2xyz(latitude, longitude, param.globeRadius); 

        position.x = cubePos.x;
        position.y = cubePos.y;
        position.z = cubePos.z;

        rotation.x = rotation.y = rotation.z = 0;

        quaternion.setFromEuler( rotation );

        scale.x = scale.y = scale.z = 1;

        matrix.compose( position, quaternion, scale );

    };

}();


init(aboutGlobe);
main();
render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function degreeToRadian(angle) {
        const radians = Math.PI / 180
        return angle * radians;
    }

//longtidude, latitude to XYZ
function lglt2xyz(country,radius) {

    let longitude = country[0]
    let latitude = country[1]

    const r = degreeToRadian(90 - longitude)
    const s = degreeToRadian(latitude + (180))

    const x = (-radius * Math.sin(r) * Math.cos(s))
    const y = (radius * Math.cos(r))
    const z = (radius * Math.sin(r) * Math.sin(s))

    return new THREE.Vector3(x, y, z)

}

function init(target=null, showStat=false) {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xF7F9FA );
    //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false} );
    renderer.setPixelRatio( window.devicePixelRatio );
    let mobile = (window.innerWidth <= 640) ? true : false;
    if (mobile) {
        renderer.setSize( window.innerWidth, window.innerWidth );
    } else {
        renderer.setSize( aboutGlobe.offsetWidth, aboutGlobe.offsetHeight );
    }
    if (target) {
        target.appendChild( renderer.domElement );
    } else {
        document.body.appendChild( renderer.domElement );
    }

    if (showStat) {
        stats = new Stats();
        document.body.appendChild( stats.dom );
    }
    
    if (mobile) {
        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerWidth, 1, 1000 );
    } else {
        camera = new THREE.PerspectiveCamera( 50, target.offsetWidth / target.offsetHeight, 1, 1000 );
    }
    // camera = new THREE.PerspectiveCamera( 50, target.offsetWidth / target.offsetHeight, 1, 1000 );
    camera.position.set( 0, 0, -280 );


    // controls
    controls = new OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.maxPolarAngle = Math.PI / 2;

}


function main() {

    //Convert country cordinate to XYZ
    VietNam = lglt2xyz ( country.VietNam, param.globeRadius);
    American = lglt2xyz ( country.American, param.globeRadius);
    China = lglt2xyz ( country.China, param.globeRadius)
    Belarus = lglt2xyz ( country.Belarus, param.globeRadius);
    Cameroon = lglt2xyz (country.Cameroon, param.globeRadius);
    Argentina = lglt2xyz (country.Argentina, param.globeRadius);
    Canada = lglt2xyz (country.Canada, param.globeRadius);

    //Add Logo Location
    // svg.loadLogo(0.03,VietNam);
    // svg.loadLogo(0.03,American);
    // svg.loadLogo(0.03,China);
    // svg.loadLogo(0.03,Belarus);
    // svg.loadLogo(0.03,Cameroon);

    //Add Pin Location
    AddPin(VietNam);
    AddPin(American);
    AddPin(China);
    AddPin(Belarus);
    AddPin(Cameroon);
    AddPin(Argentina);

    //create Curve Object
    VN_US = new curve.Curves(VietNam, American)
    VN_CH = new curve.Curves(China,VietNam)
    VN_BR = new curve.Curves(VietNam, Belarus)
    VN_CR = new curve.Curves(Cameroon, VietNam)
    VN_AR = new curve.Curves(VietNam, Argentina)
    VN_CA = new curve.Curves(Canada, VietNam)

    //Draw Curve
    VN_US.getCurve()
    VN_CH.getCurve()
    VN_BR.getCurve()
    VN_CR.getCurve()   
    VN_AR.getCurve();
    VN_CA.getCurve();

    //Draw Globe Sphere
    DrawGlobe();
    DrawGlobeAtmosphere();

    //DrawSphereDot();

    //Draw Light
    Light();

    window.addEventListener( 'resize', onWindowResize );

};

function AddPin( country ) {

    let mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(1,20,20),
        new THREE.MeshNormalMaterial()
    )

    mesh.position.set(country.x,country.y,country.z);
    scene.add(mesh);

}

function DrawGlobe() {

    const loader = new THREE.TextureLoader();
    
    const material = new THREE.MeshBasicMaterial({
        transparent: false,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        //map: loader.load('https://iamtung-0000.github.io/OCG-Globe/textures/earth_region.png'),
        map: loader.load('https://iamtung-0000.github.io/OCG-Globe//textures/earth_region_dot.png'),
        });

    
    const materialMesh = new THREE.Mesh(
        new THREE.SphereGeometry(param.globeRadius-2,param.sphereLon,param.sphereLat),
        material
    )

    scene.add(materialMesh);

};

function DrawGlobeAtmosphere() {

    const loader = new THREE.TextureLoader();
    

    var material	= glow.THREEx.createAtmosphereMaterial()

    material.uniforms.glowColor.value	= new THREE.Color(0x54bdfc)
	material.uniforms.coeficient.value	= 0.5
	material.uniforms.power.value		= 1.4
    
    const materialMesh = new THREE.Mesh(
        new THREE.SphereGeometry(param.globeRadius-2.1,param.sphereLon,param.sphereLat),
        material
    )

    scene.add(materialMesh);

};


function visibilityForCoordinate(long, lat) {

    //const imagedata;
    //get long, lat corndinate, 
    //read image data if data = 255 true, else false

}

function latLonToOffsets(latitude, longitude, mapWidth, mapHeight) {
    const radius = mapWidth / (2 * Math.PI);
    const FE = 180; // false easting

    const lonRad = degreeToRadian(longitude + FE);
    const x = lonRad * radius;

    const latRad = degreeToRadian(latitude);
    const verticalOffsetFromEquator =
        radius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = mapHeight / 2 - verticalOffsetFromEquator;

    return { x, y };
    
}

function DrawSphereDot() {

    const BoxGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    const BoxMaterial = new THREE.MeshNormalMaterial();
    const matrix = new THREE.Matrix4();
    const mesh = new THREE.InstancedMesh( BoxGeometry, BoxMaterial, 32475 );
    let t = 1;

    for (  latitude = -90; latitude < 90; latitude += 1) { 
        const a = Math.abs((Math.abs(latitude)) - 90) ;

        for (  longitude = 0; longitude < 360; longitude += 360/(4*a) ) { 
            //find x,y offset
            const offset = latLonToOffsets(latitude, longitude, 2048, 1024);
            
            //find alpha base on x,y
            t++;
            TransformMatrix( matrix );
            //set matrix transformation
            mesh.setMatrixAt( t, matrix );
        }
    }

    scene.add( mesh );

}


function Light() {

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

}

function onWindowResize() {

    // Clear previous timeout every time resize event triggered
    clearTimeout(renderDefer)

    // Set timeout: Wait 100ms before re-render the canvas
    let timeout = 100
    renderDefer = setTimeout(() => {
        let mobile = (window.innerWidth <= 640) ? true : false;

        if (mobile) {
            camera.aspect = window.innerWidth / window.innerWidth;
        } else {
            camera.aspect = aboutGlobe.offsetWidth / aboutGlobe.offsetHeight;
        }
        camera.updateProjectionMatrix();
        if (mobile) {
            renderer.setSize( window.innerWidth, window.innerWidth );
        } else {
            renderer.setSize( aboutGlobe.offsetWidth, aboutGlobe.offsetHeight );
        }
    }, timeout);

}

function animate() {

    requestAnimationFrame( animate ); 

    //Animate Line

    icr+= 1;
    let move = Math.floor(Math.sin(icr/param.LineSpeed)*3100)
    if (icr > 3000) icr = 0

    VN_US.geometry.setDrawRange(move, 3100);
    VN_CH.geometry.setDrawRange(move, 3100);
    VN_BR.geometry.setDrawRange(move, 3100);
    VN_CR.geometry.setDrawRange(move, 3100);
    VN_AR.geometry.setDrawRange(move, 3100);
    VN_CA.geometry.setDrawRange(move, 3100);
    //
    
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
    // stats.update()

}



function render() {
    renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.render( scene, camera );
}