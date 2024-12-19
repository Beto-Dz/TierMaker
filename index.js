// funcion que permite recuperar rapidamente un elemento
const query = (el) => document.querySelector(el);

//funcion que permite recuperar multiples elementos
const queryAll = (els) =>  document.querySelectorAll(els);

//input de imagen
const imageInput = query('#image_input');
//seccion de items
const itemsSection = query('#selector_items');
//reset button
const reset_tier_button = query('#reset_tier_button');
//save button
const save_tier_button = query('#save_tier_button');

//: variables de ayuda
let draggedElement = null; //elemento que esta siendo arrastrado
let sourceElement = null; //elemento desde el que esta siendo arrastrado

// : inicio del arrastre
const handleDragStart = (event) => {
    const {target} = event;
    // console.log('drag Start', target);
    draggedElement = target;
    //obtenemos el nodo padre del elemento arrastrable
    // interesante para saber desde donde se está arrastrando
    sourceElement = draggedElement.parentNode;

    //cuando inicia el arrastre
    //indicamos que la transferencia de data es en texto plano el src del elemento que estamos arrastrando
    //podemos transferir un json, o lo que se necesite
    event.dataTransfer.setData('text/plain', draggedElement.src);
};
// : fin del arrastre
const handleDragEnd = ({target}) => {
    // console.log('drag end', target);
    //ya no estamos arrastrando
    draggedElement = null;
    sourceElement = null;
};

// : funcion crear elemento de tipo imagen
const createImgElement = (src) => { 
    //creamos un elemento imagen
    const imageElement = document.createElement('img');
    //: establecemos el src de la imagen, el result es "la imagen parseada"
    //: lee el archivo de forma binaria y lo transforma en un texto que 
    //: se puede renderizar como un src de una imagen
    imageElement.src = src;
    // console.log(eventOnLoad.target.result);
    imageElement.className = 'item_image';

    //: establecemos la propiedad draggable en true
    // --le decimos que puede ser arrastrable, disponible en todos elementos DOM--
    imageElement.draggable = true;

    //: establecemos los eventos de arrastre
    imageElement.addEventListener('dragstart', handleDragStart);
    imageElement.addEventListener('dragend', handleDragEnd);

    return imageElement;
};
//: funcion para crear los img items a partir de los archivos
const useFilesToCreateItems = (files) => { 
     //si existe un archivo
    if(files && files.length > 0){
        //como aveces no es un array como tal, lo transformamos para asegurarnos
        Array.from(files).forEach((file) => { 
            //creamos un lector de archivos
            const reader = new FileReader();

            //: definimos la funcion a ejecutar cuando se dispare el evento load (cargado)
            //https://developer.mozilla.org/es/docs/Web/API/FileReader/load_event
            reader.onload = ({target}) => { 
                // target.result es la URL generada por readAsDataURL
                const img = createImgElement(target.result);
                //agregamos la imagen al contenedor de elementos img
                itemsSection.appendChild(img);
            }

            //: leemos el file como si fuera una url -data:- (para mostrarla en la seccion de items)
            // convierte el archivo binario en una url, cuando termine, automaticamente
            // se dispara el evento load y cuando se dispara ese evento, ejecuta la funcion (onload linea 66-69)
            reader.readAsDataURL(file);
        });
    }
};

//: evento al input de imagen, --cuando cambie--
imageInput.addEventListener('change' , ({target}) => { 
    //obtenemos la lista de archivos (muchas veces NO ES UN ARRAY)
    const {files} = target;

    useFilesToCreateItems(files);
} );

//evento de boton reset
reset_tier_button.addEventListener('click', () => { 
    //recuperamos todos los item images que estén dentro del tier
    // para no seleccionar los '.item_image' que no hemos sacado del
    //itemsSection
    const items = queryAll('.tier .item_image');

    //para cada item
    items.forEach((item) => { 
        //los movemos al itemSection, los quita
        // autimaticamente del row donde estén
        itemsSection.appendChild(item);
    });
});

// : funciones para eventos 
//cuando se arrastra un elemento de el
const handleDrop = (e) => { 
    e.preventDefault();
    //recuperamos el elemento que esta generando el evento y que datos se estan transfiriendo
    const { currentTarget, dataTransfer} = e;

    //si estamos arrastrando un elemento y viene de un sitio
    if(draggedElement && sourceElement){
        //eliminamos ese elemento del sitio que viene
        sourceElement.removeChild(draggedElement);
    }

    //si tenemos un elemento que estamos arrastrando
    if(draggedElement){
        // recuperando el dataTransfer en texto plano 
        // dataTransfer ss accesible durante los eventos de arrastre, como dragstart, dragover, drop, etc.
        const src = dataTransfer.getData('text/plain', draggedElement.src);
        // creamos la imagen con el source del elemento actual
        const imgElement = createImgElement(src);
        // en el elemento actual en el que soltemos la imagen, le agregamos el hijo
        currentTarget.appendChild(imgElement);
        currentTarget.classList.remove('drag__over');

        //en la row actual hacemos una consulta si existe un elemento con la clase 'preview_element'
        // y si lo tiene, lo elimina
        currentTarget.querySelector('.preview_element')?.remove();
    }
};

//cuando pasamos un elemento sobre el
const handleDragOver = (e) => { 
    e.preventDefault();
    const {currentTarget} = e;

    // si el elemento actual sobre el que se esta pasando la imagen es el mismo 
    // elemento del que viene la imagen, retornamos, ya que es inecesario
    if(currentTarget === sourceElement) return;

    //obtenemos el elmento actual sobre el que estamos pasando por encima
    currentTarget.classList.add('drag__over');
    
    const preview = query('.preview_element');
    // si existe un elemento que esta siendo arrastrado
    //si tenemos un elemento que esta siendo arrastrado y no existe el elemento
    //preview renderizado en el DOM
    if(draggedElement && !preview){
        //clonamos el elemento de manera profunda (con el true) en el DOM
        const previewElement = draggedElement.cloneNode(true);
        previewElement.classList.add('preview_element');
        currentTarget.appendChild(previewElement);
    }

    // console.log('drag over')
};

//cuando se pasa un elemento sobre el y pasamos de largo
const handleDragLeave = (e) => { 
    e.preventDefault();
    const {currentTarget} = e;
    currentTarget.classList.remove('drag__over');
    currentTarget.querySelector('.preview_element')?.remove();
};

//recuperamos todas las filas
const rows = queryAll('.row');

//para cada row
rows.forEach((row) => {
    // evento --cuando soltemos--
    row.addEventListener('drop', handleDrop);
    // evento --cuando pasemos por encima la imagen--
    row.addEventListener('dragover', handleDragOver);
    // evento --cuando pasemos y pasemos de largo--
    row.addEventListener('dragleave', handleDragLeave);
});

//: eventos exclusivos para el itemsSection
//cuando pasemos sobre el elemento
const handleDragOverFromDesktop = (e) => { 
    e.preventDefault();

    //ya viene con el data transfer si es que los arrastramos del desktop
    const {currentTarget, dataTransfer} = e;

    const images = currentTarget.querySelectorAll('.drawOver');

    //si los archivos incluidos en el dataTransfer son de tipo archivos
    if(dataTransfer.types.includes('Files') && !images){
        currentTarget.classList.add('drawOver');
    }
};

//cuando soltemos
const handleDropFromDesktop = (e) => {
    e.preventDefault();
    const {currentTarget, dataTransfer} = e;

    //validamos de nuevo
    if(dataTransfer.types.includes('Files')){
        currentTarget.classList.remove('drawOver');
        const {files} = dataTransfer;
        useFilesToCreateItems(files);
    }
    
};

// tambien agregamos los eventos mismos al contenemos de imagenes
itemsSection.addEventListener('drop', handleDrop);
itemsSection.addEventListener('dragover', handleDragOver);
itemsSection.addEventListener('dragleave', handleDragLeave);
//evento de drag and drop desde el desktop al items container
itemsSection.addEventListener('dragover', handleDragOverFromDesktop);
itemsSection.addEventListener('drop', handleDropFromDesktop);

save_tier_button.addEventListener('click', () => { 
    const tierContainer = query('.tier');
    const canvas = document.createElement('canvas');
    const contexto = canvas.getContext('2d');

    //IMPORTACION DINÁMICA, SOLO SE IMPORTARÁ CUANDO SE HACE CLICK AQUI
    //devuelve una promesa y tenemos que extraer el modulo que acabamos de cargar
    import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm')
        .then(({default: html2canvas}) => {
            html2canvas(tierContainer).then(canvas => {
                contexto.drawImage(canvas, 0, 0);

                const imgURL = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = 'MiTier.png';
                downloadLink.href = imgURL;
                downloadLink.click();
            });
        });
});