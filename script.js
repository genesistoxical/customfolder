const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const colorPicker = document.getElementById("colorPicker");
const exportBtn = document.getElementById("exportBtn");
const duplicateBtn = document.getElementById("duplicate");
const deleteBtn = document.getElementById("delete");
const contextMenu = document.getElementById("contextMenu");
const toFrontBtn = document.getElementById("bringToFront");
const toBackBtn = document.getElementById("sendToBack");

const handleSize = 10;
const rotateHandleRadius = 6;

let svgColor = "#77c0ee";
let currentSvgName = "N1";
let images = [];
let selectedImage = null;
let dragging = false, resizing = false, rotating = false;
let dragOffset = { x: 0, y: 0 };
let rotateStartAngle = 0, initialRotation = 0;

const svgTemplates = {
  N1: (color) => `
    <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      <g id="📁">
        <path d="M255,238.5C255,233.257 250.743,229 245.5,229L10.5,229C5.257,229 1,233.257 1,238.5C1,243.743 5.257,248 10.5,248L245.5,248C250.743,248 255,243.743 255,238.5Z" style="fill-opacity:0.1;"/>
        <g>
          <path d="M240,45.431C240,39.669 235.322,34.991 229.56,34.991L26.44,34.991C20.678,34.991 16,39.669 16,45.431L16,198.551C16,204.313 20.678,208.991 26.44,208.991L229.56,208.991C235.322,208.991 240,204.313 240,198.551L240,45.431Z" style="fill:${color};"/>
          <path d="M99.113,43.42C99.113,28.287 86.827,16 71.693,16L26.418,16C20.668,16 16,20.668 16,26.418L16,198.017C16,203.522 20.469,207.991 25.974,207.991L89.14,207.991C94.644,207.991 99.113,203.522 99.113,198.017L99.113,43.42Z" style="fill:${color};"/>
        </g>
        <g>
          <path d="M223.983,49.82L223.983,72.18C223.983,73.184 223.168,74 222.163,74L33.835,74C32.83,74 32.015,73.184 32.015,72.18L32.015,49.82C32.015,48.816 32.83,48 33.835,48L222.163,48C223.168,48 223.983,48.816 223.983,49.82Z" style="fill:white;"/>
          <rect x="32" y="55" width="191.968" height="2" style="fill:rgb(233,233,233);"/>
          <path d="M227,58.82L227,81.18C227,82.184 226.184,83 225.18,83L30.82,83C29.816,83 29,82.184 29,81.18L29,58.82C29,57.816 29.816,57 30.82,57L225.18,57C226.184,57 227,57.816 227,58.82Z" style="fill:white;"/>
        </g>
        <path d="M251,77.38C251,71.651 246.349,67 240.62,67L15.38,67C9.651,67 5,71.651 5,77.38L5,229.62C5,235.349 9.651,240 15.38,240L240.62,240C246.349,240 251,235.349 251,229.62L251,77.38Z" style="fill:${color};"/>
      </g>
    </svg>
  `,
  N2: (color) => `
    <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      <g id="📁">
        <path d="M255,238.5C255,233.257 250.743,229 245.5,229L10.5,229C5.257,229 1,233.257 1,238.5C1,243.743 5.257,248 10.5,248L245.5,248C250.743,248 255,243.743 255,238.5Z" style="fill-opacity:0.1;"/>
        <g>
          <path d="M99,49.549C99,31.033 83.967,16 65.451,16L21,16C18.24,16 16,18.24 16,21L16,70C16,72.76 18.24,75 21,75L94,75C96.76,75 99,72.76 99,70L99,49.549Z" style="fill:${color};"/>
          <path d="M240,40C240,37.24 237.76,35 235,35L21,35C18.24,35 16,37.24 16,40L16,71C16,73.76 18.24,76 21,76L235,76C237.76,76 240,73.76 240,71L240,40Z" style="fill:${color};"/>
        </g>
        <g>
          <path d="M223.983,49.82L223.983,72.18C223.983,73.184 223.168,74 222.163,74L33.835,74C32.83,74 32.015,73.184 32.015,72.18L32.015,49.82C32.015,48.816 32.83,48 33.835,48L222.163,48C223.168,48 223.983,48.816 223.983,49.82Z" style="fill:white;"/>
          <rect x="32" y="55" width="191.968" height="2" style="fill:rgb(233,233,233);"/>
          <path d="M227,58.82L227,81.18C227,82.184 226.184,83 225.18,83L30.82,83C29.816,83 29,82.184 29,81.18L29,58.82C29,57.816 29.816,57 30.82,57L225.18,57C226.184,57 227,57.816 227,58.82Z" style="fill:white;"/>
        </g>
        <path d="M251,71.971C251,69.228 248.772,67 246.029,67L9.971,67C7.228,67 5,69.228 5,71.971L5,235.029C5,237.772 7.228,240 9.971,240L246.029,240C248.772,240 251,237.772 251,235.029L251,71.971Z" style="fill:${color};"/>
      </g>
    </svg>
  `,
  R1: (color) => `
    <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      <g id="📁">
        <g opacity="0.1">
          <path d="M196.053,243.504C196.053,248.75 191.795,253.008 186.549,253.008L26.504,253.008C21.259,253.008 17,248.75 17,243.504C17,238.259 21.259,234 26.504,234L186.549,234C191.795,234 196.053,238.259 196.053,243.504Z"/>
          <path d="M233,233.503C233,238.749 228.741,243.007 223.496,243.007L185.504,243.007C180.259,243.007 176,238.749 176,233.503C176,228.258 180.259,223.999 185.504,223.999L223.496,223.999C228.741,223.999 233,228.258 233,233.503Z"/>
          <path d="M194.428,248.818C194.428,248.818 198.053,242.56 206.271,243.007C205.387,237.272 201.861,242.252 201.861,242.252L195.653,242.755L191.996,248.326L194.428,248.818Z"/>
        </g>
        <g>
          <path d="M216.83,235C222.447,235 227.007,230.44 227.007,224.823L227.007,23.177C227.007,17.56 222.447,13 216.83,13L67.56,13C61.943,13 57.383,17.56 57.383,23.177L57.383,224.823C57.383,230.44 61.943,235 67.56,235L216.83,235Z" style="fill:${color};"/>
          <path d="M209.949,95C224.884,95 237.009,82.875 237.009,67.94L237.009,23.348C237.009,17.637 232.372,13 226.661,13L59.376,13C53.945,13 49.536,17.409 49.536,22.84L49.536,85.16C49.536,90.591 53.945,95 59.376,95L209.949,95Z" style="fill:${color};"/>
        </g>
        <g>
          <path d="M209.18,220.953L186.82,220.953C185.816,220.953 185,220.137 185,219.133L185,28.865C185,27.861 185.816,27.045 186.82,27.045L209.18,27.045C210.184,27.045 211,27.861 211,28.865L211,219.133C211,220.137 210.184,220.953 209.18,220.953Z" style="fill:white;"/>
          <path d="M202,220.953L202,27.045L204,27.045L204,220.953L202,220.953Z" style="fill:rgb(233,233,233);"/>
          <path d="M200.18,224L177.82,224C176.816,224 176,223.184 176,222.18L176,25.82C176,24.816 176.816,24 177.82,24L200.18,24C201.184,24 202,24.816 202,25.82L202,222.18C202,223.184 201.184,224 200.18,224Z" style="fill:white;"/>
        </g>
        <path d="M181.736,245.007C187.399,245.007 191.996,240.41 191.996,234.748L191.996,13.267C191.996,7.605 187.399,3.007 181.736,3.007L31.26,3.007C25.597,3.007 21,7.605 21,13.267L21,234.748C21,240.41 25.597,245.007 31.26,245.007L181.736,245.007Z" style="fill:${color};"/>
      </g>
    </svg>
  `,
  R2: (color) => `
    <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      <g id="📁">
        <g opacity="0.1">
          <path d="M197.053,243.504C197.053,248.75 192.795,253.008 187.549,253.008L26.504,253.008C21.259,253.008 17,248.75 17,243.504C17,238.259 21.259,234 26.504,234L187.549,234C192.795,234 197.053,238.259 197.053,243.504Z"/>
          <path d="M234,233.503C234,238.749 229.741,243.007 224.496,243.007L186.504,243.007C181.259,243.007 177,238.749 177,233.503C177,228.258 181.259,223.999 186.504,223.999L224.496,223.999C229.741,223.999 234,228.258 234,233.503Z"/>
          <path d="M195.428,248.818C195.428,248.818 199.053,242.56 207.271,243.007C206.387,237.272 202.861,242.252 202.861,242.252L196.653,242.755L192.996,248.326L195.428,248.818Z"/>
        </g>
        <g>
          <path d="M206.185,95C223.194,95 237.004,81.19 237.004,64.18L237.004,17.593C237.004,15.058 234.946,13 232.411,13L187.398,13C184.863,13 182.805,15.058 182.805,17.593L182.805,90.407C182.805,92.942 184.863,95 187.398,95L206.185,95Z" style="fill:${color};"/>
          <path d="M222.437,80C224.957,80 227.004,82.046 227.004,84.566L227.004,230.434C227.004,232.954 224.957,235 222.437,235L176.126,235C173.606,235 171.56,232.954 171.56,230.434L171.56,84.566C171.56,82.046 173.606,80 176.126,80L222.437,80Z" style="fill:${color};"/>
        </g>
        <g>
          <path d="M209.18,220.953L186.82,220.953C185.816,220.953 185,220.137 185,219.133L185,28.865C185,27.861 185.816,27.045 186.82,27.045L209.18,27.045C210.184,27.045 211,27.861 211,28.865L211,219.133C211,220.137 210.184,220.953 209.18,220.953Z" style="fill:white;"/>
          <path d="M202,220.953L202,27.045L204,27.045L204,220.953L202,220.953Z" style="fill:rgb(233,233,233);"/>
          <path d="M200.18,224L177.82,224C176.816,224 176,223.184 176,222.18L176,25.82C176,24.816 176.816,24 177.82,24L200.18,24C201.184,24 202,24.816 202,25.82L202,222.18C202,223.184 201.184,224 200.18,224Z" style="fill:white;"/>
        </g>
        <path d="M187.082,245C189.794,245 191.996,242.798 191.996,240.086L191.996,7.914C191.996,5.202 189.794,3 187.082,3L25.914,3C23.202,3 21,5.202 21,7.914L21,240.086C21,242.798 23.202,245 25.914,245L187.082,245Z" style="fill:${color};"/>
      </g>
    </svg>
  `,
  S1: (color) => `
    <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      <g id="📁">
        <path d="M254.999,239.652C254.999,234.953 251.184,231.139 246.486,231.139L9.514,231.139C4.816,231.139 1.001,234.953 1.001,239.652C1.001,244.35 4.816,248.164 9.514,248.164L246.486,248.164C251.184,248.164 254.999,244.35 254.999,239.652Z" style="fill-opacity:0.1;"/>
        <g>
          <path d="M240,62.351C240,57.188 235.808,52.996 230.645,52.996L25.355,52.996C20.192,52.996 16,57.188 16,62.351L16,199.558C16,204.721 20.192,208.913 25.355,208.913L230.645,208.913C235.808,208.913 240,204.721 240,199.558L240,62.351Z" style="fill:${color};"/>
          <path d="M99.113,62.43C99.113,47.296 86.827,35.01 71.693,35.01L25.974,35.01C20.469,35.01 16,39.479 16,44.983L16,197.075C16,202.579 20.469,207.048 25.974,207.048L89.14,207.048C94.644,207.048 99.113,202.579 99.113,197.075L99.113,62.43Z" style="fill:${color};"/>
        </g>
        <g>
          <path d="M223.983,68.82L223.983,91.18C223.983,92.184 223.168,93 222.163,93L33.835,93C32.83,93 32.015,92.184 32.015,91.18L32.015,68.82C32.015,67.816 32.83,67 33.835,67L222.163,67C223.168,67 223.983,67.816 223.983,68.82Z" style="fill:white;"/>
          <rect x="32" y="74" width="191.968" height="2" style="fill:rgb(233,233,233);"/>
          <path d="M227,77.82L227,100.18C227,101.184 226.184,102 225.18,102L30.82,102C29.816,102 29,101.184 29,100.18L29,77.82C29,76.816 29.816,76 30.82,76L225.18,76C226.184,76 227,76.816 227,77.82Z" style="fill:white;"/>
        </g>
        <path d="M251,94.276C251,89.142 246.832,84.975 241.699,84.975L14.301,84.975C9.168,84.975 5,89.142 5,94.276L5,230.695C5,235.828 9.168,239.996 14.301,239.996L241.699,239.996C246.832,239.996 251,235.828 251,230.695L251,94.276Z" style="fill:${color};"/>
      </g>
    </svg>
  `,
  S2: (color) => `
    <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      <g id="📁">
        <path d="M254.999,239.652C254.999,234.953 251.184,231.139 246.486,231.139L9.514,231.139C4.816,231.139 1.001,234.953 1.001,239.652C1.001,244.35 4.816,248.164 9.514,248.164L246.486,248.164C251.184,248.164 254.999,244.35 254.999,239.652Z" style="fill-opacity:0.1;"/>
        <g>
          <path d="M99,65.065C99,48.473 85.529,35.002 68.937,35.002L20.48,35.002C18.008,35.002 16,37.01 16,39.483L16,83.391C16,85.864 18.008,87.872 20.48,87.872L94.52,87.872C96.992,87.872 99,85.864 99,83.391L99,65.065Z" style="fill:${color};"/>
          <path d="M240,57.48C240,55.007 237.992,53 235.52,53L20.48,53C18.008,53 16,55.007 16,57.48L16,85.259C16,87.732 18.008,89.74 20.48,89.74L235.52,89.74C237.992,89.74 240,87.732 240,85.259L240,57.48Z" style="fill:${color};"/>
        </g>
        <g>
          <path d="M223.983,68.82L223.983,91.18C223.983,92.184 223.168,93 222.163,93L33.835,93C32.83,93 32.015,92.184 32.015,91.18L32.015,68.82C32.015,67.816 32.83,67 33.835,67L222.163,67C223.168,67 223.983,67.816 223.983,68.82Z" style="fill:white;"/>
          <rect x="32" y="74" width="191.968" height="2" style="fill:rgb(233,233,233);"/>
          <path d="M227,77.82L227,100.18C227,101.184 226.184,102 225.18,102L30.82,102C29.816,102 29,101.184 29,100.18L29,77.82C29,76.816 29.816,76 30.82,76L225.18,76C226.184,76 227,76.816 227,77.82Z" style="fill:white;"/>
        </g>
        <path d="M251,89.422C251,86.964 249.004,84.968 246.545,84.968L9.455,84.968C6.996,84.968 5,86.964 5,89.422L5,235.538C5,237.997 6.996,239.993 9.455,239.993L246.545,239.993C249.004,239.993 251,237.997 251,235.538L251,89.422Z" style="fill:${color};"/>
      </g>
    </svg>
  `,
};

function Draw() {
  const templateFn = svgTemplates[currentSvgName];
  if (!templateFn) return;

  const svgBlob = new Blob([templateFn(svgColor)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  const bg = new Image();
  bg.onload = () =>
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);

    for (const obj of images)
	{
      ctx.save();
      const cx = obj.x + obj.width / 2, cy = obj.y + obj.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(obj.rotation || 0);
      ctx.drawImage(obj.img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);

      if (obj === selectedImage)
	  {
        // Borde para indicar la imagen seleccionada
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);

        // Recuadro en la esquina para redimensionar
        ctx.fillStyle = "blue";
        ctx.fillRect(obj.width / 2 - handleSize, obj.height / 2 - handleSize, handleSize, handleSize);

        // Círculo de rotar
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(obj.width / 1.9 - handleSize / 1.9, -obj.height / 1.9 + handleSize / 1.9, handleSize / 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    URL.revokeObjectURL(url);
  };
  bg.src = url;
}

// Evita que al guardar el icono, se vea la selección
function DrawWithoutSelection(callback)
{
  const templateFn = svgTemplates[currentSvgName];
  if (!templateFn) return;

  const svgBlob = new Blob([templateFn(svgColor)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  const bg = new Image();
  bg.onload = () =>
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);

    for (const obj of images)
	{
      ctx.save();
      const cx = obj.x + obj.width / 2, cy = obj.y + obj.height / 2; ctx.translate(cx, cy); ctx.rotate(obj.rotation || 0);
      ctx.drawImage(obj.img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
      ctx.restore();
    }

    URL.revokeObjectURL(url);
    if (callback) callback();
  };
  bg.src = url;
}

function getMousePos(evt)
{
  const rect = canvas.getBoundingClientRect();
  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

function hitSelection(pos)
{
  for (let i = images.length - 1; i >= 0; i--)
  {
    const obj = images[i];
    if (drawInRotate(pos, obj))
	{
      return obj;
    }
  }
  return null;
}

function drawInRotate(point, obj)
{
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const angle = -(obj.rotation || 0);

  const dx = point.x - cx;
  const dy = point.y - cy;

  const x = dx * Math.cos(angle) - dy * Math.sin(angle);
  const y = dx * Math.sin(angle) + dy * Math.cos(angle);

  return (x >= -obj.width / 2 && x <= obj.width / 2 && y >= -obj.height / 2 && y <= obj.height / 2);
}

function inHandle(obj, pos, type)
{
  const local = toLocalCoords(pos, obj);
  if (type === "resize")
  {
    return (local.x >= obj.width / 2 - handleSize && local.x <= obj.width / 2 && local.y >= obj.height / 2 - handleSize && local.y <= obj.height / 2);
  }
  else if (type === "rotate")
  {
    const dx = local.x - obj.width / 2;
    const dy = local.y + obj.height / 2;
    return dx * dx + dy * dy <= rotateHandleRadius * rotateHandleRadius;
  }
  return false;
}

function toLocalCoords(pos, obj)
{
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const angle = -(obj.rotation || 0);

  const dx = pos.x - cx;
  const dy = pos.y - cy;

  return
  {
    x: dx * Math.cos(angle) - dy * Math.sin(angle),
    y: dx * Math.sin(angle) + dy * Math.cos(angle),
  };
}

function modifySelectedImage(action)
{
  if (!selectedImage) return;
  const index = images.indexOf(selectedImage);
  if (index === -1) return;
  action(index);
  Draw();
}

async function getPngBytesFromCanvas(canvas, size)
{
  const offscreen = new OffscreenCanvas(size, size);
  const ctx = offscreen.getContext("2d");

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(canvas, 0, 0, size, size); // Draw whole canvas scaled

  const blob = await offscreen.convertToBlob({ type: "image/png" });
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Guardar en formato ICO
async function createICO()
{
  const sizes = [16, 32, 48, 64, 128, 256];
  const prevSelected = selectedImage;
  selectedImage = null;

  // Dibuja sin selección
  DrawWithoutSelection(async () =>
  {
    const iconParts = await Promise.all(sizes.map((size) => getPngBytesFromCanvas(canvas, size)));
    selectedImage = prevSelected;
    Draw();

    const headerSize = 6 + iconParts.length * 16;
    const totalSize = headerSize + iconParts.reduce((sum, part) => sum + part.length, 0);
    const ico = new Uint8Array(totalSize);

    ico.set([0, 0, 1, 0, iconParts.length, 0], 0);

    let offset = headerSize;
    iconParts.forEach((part, i) =>
	{
      const size = sizes[i];
      const width = size === 256 ? 0 : size;
      const height = size === 256 ? 0 : size;
      const entryOffset = 6 + i * 16;

      ico[entryOffset] = width;
      ico[entryOffset + 1] = height;
      ico[entryOffset + 2] = 0;
      ico[entryOffset + 3] = 0;
      ico[entryOffset + 4] = 1;
      ico[entryOffset + 5] = 0;
      ico[entryOffset + 6] = 32;
      ico[entryOffset + 7] = 0;

      ico[entryOffset + 8] = part.length & 0xff;
      ico[entryOffset + 9] = (part.length >> 8) & 0xff;
      ico[entryOffset + 10] = (part.length >> 16) & 0xff;
      ico[entryOffset + 11] = (part.length >> 24) & 0xff;

      ico[entryOffset + 12] = offset & 0xff;
      ico[entryOffset + 13] = (offset >> 8) & 0xff;
      ico[entryOffset + 14] = (offset >> 16) & 0xff;
      ico[entryOffset + 15] = (offset >> 24) & 0xff;

      ico.set(part, offset);
      offset += part.length;
    });

    const blob = new Blob([ico], { type: "image/x-icon" });
    const link = document.createElement("a");
    link.download = "Folder.ico";
    link.href = URL.createObjectURL(blob);
    link.click();
  });
}

function renderBoxesWithSVGs()
{
  const boxes = document.querySelectorAll('.box');

  boxes.forEach(box =>
  {
    const color = box.dataset.color || '#77C0EE';
    const svgName = box.dataset.svg || 'N1';
    const getSvg = svgTemplates[svgName];

    if (typeof getSvg === 'function')
	{
      const svg = getSvg(color);
      box.innerHTML = svg;
      box.style.background = 'none';
    }
  });
}

// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', renderBoxesWithSVGs);

document.querySelectorAll(".box").forEach((box) =>
{
  box.style.backgroundColor = box.dataset.color;
  box.addEventListener("click", () =>
  {
    currentSvgName = box.dataset.svg;
    Draw();
  });
});

canvas.addEventListener("mousedown", (e) =>
{
  const pos = getMousePos(e);
  const hit = hitSelection(pos);
  if (hit)
  {
    selectedImage = hit;

    if (inHandle(hit, pos, "rotate"))
	{
      rotating = true;

      const cx = hit.x + hit.width / 2;
      const cy = hit.y + hit.height / 2; rotateStartAngle = Math.atan2(pos.y - cy, pos.x - cx); initialRotation = hit.rotation || 0;
	  }
	  else if (inHandle(hit, pos, "resize"))
	  {
      resizing = true;
    }
	else
	{
      dragging = true;
      dragOffset.x = pos.x - hit.x;
      dragOffset.y = pos.y - hit.y;
    }
  }
  else
  {
    selectedImage = null;
  }
  
  Draw();
});

canvas.addEventListener("mousemove", (e) =>
{
  const pos = getMousePos(e);

  if (rotating && selectedImage)
  {
    const cx = selectedImage.x + selectedImage.width / 2;
    const cy = selectedImage.y + selectedImage.height / 2;
    const currentAngle = Math.atan2(pos.y - cy, pos.x - cx);
    let newRotation = initialRotation + (currentAngle - rotateStartAngle);

    newRotation = ((newRotation + Math.PI) % (2 * Math.PI)) - Math.PI;
    selectedImage.rotation = newRotation;
    Draw();
  }
  else if (dragging && selectedImage)
  {
    selectedImage.x = pos.x - dragOffset.x;
    selectedImage.y = pos.y - dragOffset.y;
    Draw();
  }
  else if (resizing && selectedImage)
  {
    const local = toLocalCoords(pos, selectedImage);
    const newWidth = Math.max(10, local.x + selectedImage.width / 2);
    selectedImage.width = newWidth;
    selectedImage.height = newWidth / selectedImage.aspectRatio;
    Draw();
  }
  else
  {
    const hit = hitSelection(pos);
    if (hit)
	{
      if (inHandle(hit, pos, "rotate"))
	  {
        canvas.style.cursor = "crosshair";
      }
	  else if (inHandle(hit, pos, "resize"))
	  {
        canvas.style.cursor = "nwse-resize";
      }
	  else
	  {
        canvas.style.cursor = "move";
      }
    }
	else
	{
      canvas.style.cursor = "default";
    }
  }
});

canvas.addEventListener("mouseup", () =>
{
  dragging = false;
  resizing = false;
  rotating = false;
});

fileInput.addEventListener("change", (e) =>
{
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () =>
  {
    const aspect = img.width / img.height;
    const obj =
	{
      img,
      x: 50 + images.length * 10,
      y: 50 + images.length * 10,
      width: 100,
      height: 100 / aspect,
      aspectRatio: aspect,
      rotation: 0,
    };
    images.push(obj);
    selectedImage = obj;
    Draw();
  };
  img.src = URL.createObjectURL(file);
});

colorPicker.addEventListener("input", (e) =>
{
  svgColor = e.target.value;
  Draw();
});

exportBtn.addEventListener("click", createICO);

Draw();

// Menú contextual
canvas.addEventListener("contextmenu", (e) =>
{
  e.preventDefault();
  const pos = getMousePos(e);
  const hit = hitSelection(pos);

  if (hit)
  {
    selectedImage = hit;
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.display = "block";
  }
  else
  {
    contextMenu.style.display = "none";
  }
});

document.addEventListener("click", () =>
{
  contextMenu.style.display = "none";
});

toFrontBtn.addEventListener("click", () => modifySelectedImage((index) =>
{
  images.splice(index, 1);
  images.push(selectedImage);
}));

toBackBtn.addEventListener("click", () => modifySelectedImage((index) =>
{
  images.splice(index, 1);
  images.unshift(selectedImage);
}));

duplicateBtn.addEventListener("click", () =>
{
  if (!selectedImage) return;
  const clone = {
    ...selectedImage,
    x: selectedImage.x + 20,
    y: selectedImage.y + 20,
    img: selectedImage.img,
    rotation: selectedImage.rotation,
  };
  images.push(clone);
  selectedImage = clone;
  Draw();
});

deleteBtn.addEventListener("click", () => modifySelectedImage((index) =>
{
  images.splice(index, 1);
  selectedImage = null;
}));
