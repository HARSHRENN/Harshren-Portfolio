const fs = require('fs');
const buffer = fs.readFileSync('static/models/newmodel/garage.glb');
// The GLB header is 12 bytes. 
// bytes 12-15 is the length of the JSON chunk
const jsonChunkLength = buffer.readUInt32LE(12);
// JSON chunk starts at byte 20
const jsonChunk = buffer.toString('utf8', 20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonChunk);

const paintMaterials = gltf.materials.filter(m => {
  const name = (m.name || '').toLowerCase();
  return true; // We can just list all materials and filter in JS
});

const carMaterials = paintMaterials.map(m => m.name);
console.log(carMaterials.filter(n => typeof n === 'string' && (n.toLowerCase().includes('paint') || n.toLowerCase().includes('body') || n.toLowerCase().includes('car') || n.toLowerCase().includes('green') || n.toLowerCase().includes('grey') || n.toLowerCase().includes('color') || n.toLowerCase().includes('metal') || n.toLowerCase().includes('porsche') || n.toLowerCase().includes('lykan'))));
