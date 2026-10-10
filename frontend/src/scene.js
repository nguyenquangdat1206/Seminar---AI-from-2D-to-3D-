import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

export function buildModel(kind='robot') {
  const root=new THREE.Group();
  const cream=new THREE.MeshStandardMaterial({color:'#e8dfd0',roughness:.32,metalness:.12});
  const dark=new THREE.MeshStandardMaterial({color:'#171d29',roughness:.26,metalness:.65});
  const purple=new THREE.MeshStandardMaterial({color:'#8270ff',roughness:.25,metalness:.5});
  const glow=new THREE.MeshStandardMaterial({color:'#66f5e6',emissive:'#32d7d0',emissiveIntensity:1.5});
  function ell(x,y,z,sx,sy,sz,mat=cream) {const m=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
  function tube(points,r,mat=glow){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,32,r,8,false),mat);root.add(m);return m;}
  if(kind==='robot') {
    ell(0,1.15,0,.61,.72,.4);ell(0,2.25,0,.85,.69,.57);ell(0,2.22,.47,.67,.46,.2,dark);
    [-1,1].forEach(s=>{ell(s*.85,2.28,0,.17,.32,.32,dark);ell(s*.91,2.28,.02,.13,.23,.23,purple);ell(s*.38,.39,.02,.24,.42,.27);ell(s*.38,.15,.15,.27,.17,.36);ell(s*.69,1.42,0,.23,.3,.24,dark);const arm=ell(s*.8,1.12,.02,.24,.38,.24);arm.rotation.z=s*.25;ell(s*.88,.84,.06,.19,.2,.19,dark);ell(s*.49,2.89,0,.045,.22,.045,purple);const pts=[];for(let i=0;i<=14;i++){const a=Math.PI*i/14;pts.push([s*.27+Math.cos(a)*.12,2.23+Math.sin(a)*.1,.663]);}tube(pts,.022);});
    ell(0,1.48,.38,.17,.17,.04,purple);tube([[-.09,1.02,.4],[0,.96,.42],[.09,1.04,.4]],.022,purple);
  } else if(kind==='vase') {
    const points=[];for(let i=0;i<=40;i++){const y=i/40*2.4;const radius=.35+Math.sin(i/40*Math.PI)*.55+Math.cos(i/40*Math.PI*3)*.09;points.push(new THREE.Vector2(radius,y));}const m=new THREE.Mesh(new THREE.LatheGeometry(points,80),cream);m.castShadow=true;m.receiveShadow=true;root.add(m);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.26,.045,16,80),purple);rim.rotation.x=Math.PI/2;rim.position.y=2.4;root.add(rim);
  } else if(kind==='rocket') {
    ell(0,1.5,0,.53,1.15,.53);ell(0,1.78,.48,.24,.24,.065,dark);ell(0,1.78,.54,.18,.18,.04,glow);[-1,1].forEach(s=>{const f=ell(s*.53,.65,0,.2,.62,.32,purple);f.rotation.z=-s*.28;});ell(0,.31,0,.26,.18,.26,dark);
  } else {
    ell(0,.83,0,.65,.78,.47);ell(0,1.87,.06,.64,.59,.5);[-1,1].forEach(s=>{const ear=ell(s*.28,2.6,.01,.19,.68,.2);ear.rotation.z=-s*.13;const inner=ell(s*.28,2.63,.17,.1,.48,.045,purple);inner.rotation.z=-s*.13;ell(s*.24,1.99,.51,.065,.09,.035,dark);ell(s*.4,.15,.18,.3,.17,.37);ell(s*.6,.87,0,.2,.37,.2);});ell(0,1.8,.565,.07,.045,.035,purple);ell(0,.55,-.48,.25,.25,.25);
  }
  return root;
}

export function createStudio(canvas,onInfo,onError) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#11151f');scene.fog=new THREE.Fog('#11151f',12,30);
 const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(4,2.9,6.7);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.45,0);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.53;
 const ambient=new THREE.HemisphereLight('#eef2ff','#4d435b',2.1);scene.add(ambient);
 const key=new THREE.DirectionalLight('#fff3df',4);key.position.set(3,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;scene.add(key);
 const fill=new THREE.DirectionalLight('#9580ff',2.7);fill.position.set(-4,3,-2);scene.add(fill);
 const cyan=new THREE.DirectionalLight('#9fe8eb',1);cyan.position.set(3,2,-4);scene.add(cyan);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#131925',roughness:.92}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(24,48,'#303746','#232a38');grid.position.y=-.025;grid.material.transparent=true;grid.material.opacity=.36;scene.add(grid);
 let model,frame,dead=false;
 function disposeModel(obj){if(!obj)return;obj.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}}});}
 function reset(){camera.position.set(4,2.9,6.7);controls.target.set(0,1.45,0);controls.update();}
 function setModel(obj){if(dead){disposeModel(obj);return;}if(model){scene.remove(model);disposeModel(model);}model=obj;scene.add(model);let vertices=0,faces=0;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;vertices+=o.geometry.attributes.position.count;faces+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});onInfo({vertices,faces:Math.round(faces)});reset();}
 function resize(){const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function loop(){frame=requestAnimationFrame(loop);controls.update();renderer.render(scene,camera);}loop();
 return {
  model(kind){setModel(buildModel(kind));},
  async importFile(file){const url=URL.createObjectURL(file);try{const gltf=await new GLTFLoader().loadAsync(url);const obj=gltf.scene;const box=new THREE.Box3().setFromObject(obj);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const scale=2.9/Math.max(size.x,size.y,size.z,.001);const group=new THREE.Group();obj.position.sub(center);group.add(obj);group.scale.setScalar(scale);group.position.y=size.y*scale/2;setModel(group);}catch(e){onError('Không thể đọc GLB. Hãy kiểm tra file và thử lại.');throw e;}finally{URL.revokeObjectURL(url);}},
  settings({wireframe,material,light,background,showGrid,autoRotate}){scene.background.set(background);scene.fog.color.set(background);floor.material.color.set(background);grid.visible=showGrid;ambient.intensity=.4+light/45;key.intensity=light/18;controls.autoRotate=autoRotate;controls.autoRotateSpeed=1.2;if(model)model.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];for(const mat of mats){mat.wireframe=wireframe;if(mat.isMeshStandardMaterial){if(material==='metal'){mat.metalness=.93;mat.roughness=.22;}else if(material==='clay'){mat.metalness=0;mat.roughness=.9;}else{mat.metalness=.12;mat.roughness=.32;}}}}});},
  reset,
  tool(mode){controls.mouseButtons.LEFT=mode==='pan'?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;},
  zoom(factor){camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();},
  capture(){renderer.render(scene,camera);return canvas.toDataURL('image/png');},
  async export(format){if(!model)throw new Error('Chưa có mô hình');if(format==='glb'){const data=await new GLTFExporter().parseAsync(model,{binary:true});return new Blob([data],{type:'model/gltf-binary'});}if(format==='obj')return new Blob([new OBJExporter().parse(model)],{type:'text/plain'});return new Blob([new STLExporter().parse(model)],{type:'model/stl'});},
  destroy(){dead=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();disposeModel(model);floor.geometry.dispose();floor.material.dispose();grid.geometry.dispose();grid.material.dispose();renderer.dispose();}
 };
}
