import Stage from 'three_stage'
import * as THREE from 'three'
import * as dat from "dat.gui";

import fragment from "./shader/fragment.glsl.js";
import vertex from "./shader/vertex.glsl.js";
window.THREE = THREE
class Options {
  constructor() {
    this.distanceThreshold = 75
  }
};

// 角度转弧度
function degreeToRadian(angle) {
  const radians = Math.PI / 180
  return angle * radians;
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, res => {
      resolve(res)
     })
  })
}

  /**
 * 经纬度转xyz
 * @param longitude 经度
 * @param latitude 纬度
 * @param radius 半径
 */


function lglt2xyz(longitude,latitude,radius){
  const r = degreeToRadian(90 - longitude)
  const s = degreeToRadian(latitude + 180);
  const x = -radius * Math.sin(r) * Math.cos(s)
  const y = radius * Math.cos(r)
  const z = radius * Math.sin(r) * Math.sin(s)
  return new THREE.Vector3(x, y, z)
}

class App {
  constructor() {
    window.lm = this
    this.settings = this.settings.bind(this)
    this.stage = new Stage("#app")
    this.stage.camera.position.z =80
    this.stage.run()
    this.settings()
    this.addBox(10)
  }

  settings() {
    var options = new Options();
    this.options = options

    var gui = new dat.GUI();
    const controller = gui.add(options, 'distanceThreshold', 0, 150);
    controller.onChange(value => {
      this.material && (this.material.uniforms.distanceThreshold.value = +value)
    })
  }

  visibilityForCoordinate(t, e, n) {
    const i = 4 * n.width
      , r = parseInt((t + 180) / 360 * n.width + .5)
      , s = n.height - parseInt((e + 90) / 180 * n.height - .5)
      , o = parseInt(i * (s - 1) + 4 * r) + 3;
    return n.data[o] > 90
  }

  getImageData(t) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = t.width
    ctx.canvas.height = t.height
    ctx.drawImage(t, 0, 0, t.width, t.height)
    return ctx.getImageData(0, 0, t.width, t.height)
  }

  async addBox() {
    let worldMap = await loadTexture("./res/map.png")
    var material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { type: "c", value: new THREE.Color(0xdddddd) },
        distanceThreshold: { type: "f", value: this.options.distanceThreshold },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.DoubleSide
    });
    this.material = material

    const light = new THREE.Light()
    const imageData = this.getImageData(worldMap.image)
    const instance = []
    const worldDotRows = 200;
    this.worldDotSize = 0.095
    this.radius = 25
    const cl = 25

    //---------对纹理采样生成几何体------------------------
    // 纬度-90~90

    for (let h = -90; h <= 90; h += 180 / worldDotRows) {
        const t = Math.cos(degreeToRadian(Math.abs(h))) * cl * Math.PI * 2 * 2;
        for (let r = 0; r < t; r++) {
          const s = 360 * r / t - 180;
          if (!this.visibilityForCoordinate(s, h, imageData)) {
            continue
          }
          const o = lglt2xyz(h, s, this.radius);
          light.position.set(o.x, o.y, o.z);
          const c = lglt2xyz(h, s, this.radius + 5);
          light.lookAt(c.x, c.y, c.z),
          light.updateMatrix(),
          instance.push(light.matrix.clone())
          
        }
    }
    const geometry = new THREE.CircleBufferGeometry(this.worldDotSize,64)
    const insMesh = new THREE.InstancedMesh(geometry, material, instance.length);
    for (let h = 0; h < instance.length; h++) {
      insMesh.setMatrixAt(h, instance[h]);
    }
    insMesh.name = "points"
    this.stage.scene.add(insMesh)
  }
}

window.onload = () => {
  let app = new App()
}
