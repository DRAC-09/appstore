//Codigo para generar información de categorias y almacenarlas en un arreglo.
var categorias = [];
(()=>{
  //Este arreglo es para generar textos de prueba
    let textosDePrueba=[
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolore, modi!",
        "Quos numquam neque animi ex facilis nesciunt enim id molestiae.",
        "Quaerat quod qui molestiae sequi, sint aliquam omnis quos voluptas?",
        "Non impedit illum eligendi voluptas. Delectus nisi neque aspernatur asperiores.",
        "Ducimus, repellendus voluptate quo veritatis tempora recusandae dolorem optio illum."
    ]
    //Genera dinamicamente los JSON de prueba para esta evaluacion,
    //Primer ciclo para las categorias y segundo ciclo para las apps de cada categoria

    let contador = 1;
    for (let i=0;i<5;i++){//Generar 5 categorias  
        let categoria = {
            nombreCategoria:"Categoria "+i,
            descripcion:textosDePrueba[Math.floor(Math.random() * (5 - 1))],
            aplicaciones:[]
        };
        for (let j=0;j<10;j++){//Generar 10 apps por categoria
            let aplicacion = {
                codigo:contador,
                nombre:"App "+contador,
                descripcion:textosDePrueba[Math.floor(Math.random() * (5 - 1))],
                icono:`img/app-icons/${contador}.webp`,
                instalada:contador%3==0?true:false,
                app:"app/demo.apk",
                calificacion:Math.floor(Math.random() * (5 - 1)) + 1,
                precio: Math.floor(Math.random() * 10) + 1,
                descargas:1000,
                desarrollador:`Desarrollador ${(i+1)*(j+1)}`,
                imagenes:["img/app-screenshots/1.webp","img/app-screenshots/2.webp","img/app-screenshots/3.webp"],
                comentarios:[
                    {comentario:textosDePrueba[Math.floor(Math.random() * (5 - 1))],calificacion:Math.floor(Math.random() * (5 - 1)) + 1,fecha:"12/12/2012",usuario:"Juan"},
                    {comentario:textosDePrueba[Math.floor(Math.random() * (5 - 1))],calificacion:Math.floor(Math.random() * (5 - 1)) + 1,fecha:"12/12/2012",usuario:"Pedro"},
                    {comentario:textosDePrueba[Math.floor(Math.random() * (5 - 1))],calificacion:Math.floor(Math.random() * (5 - 1)) + 1,fecha:"12/12/2012",usuario:"Maria"},
                ]
            };
            contador++;
            categoria.aplicaciones.push(aplicacion);
        }
        categorias.push(categoria);
    }
    // console.log(categorias);
})();




//---------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------


window.onload= loadJSON(categorias)

// Cargar datos al indexedDB
async function loadJSON(fname) {
    var data = new Object();
    data.categorias = fname;
    var idb = await importIDB("appstore", "categorias", data["categorias"])
    await getCategorias(idb);

}

// IndexedDB
function importIDB(idbName, objStoreName, arreglo) {
	return new Promise(function(resolve) {
	var solicitud = window.indexedDB.open(idbName)                                              
    
        // Onupgradeneeded - Creación o actualización de la base de datos.
        solicitud.onupgradeneeded = function() {                                                
			var idb = solicitud.result                                                          
			var store = idb.createObjectStore(objStoreName, {keyPath: "nombreCategoria"})       
		}
        
        // Si el evento onupgradeneeded retorna éxito, entonces se activará el manejador ONSUCCESS
        // Onsuccess - Hacer solicitudes a la base de datos.
		solicitud.onsuccess = function() {
		var idb = solicitud.result
		let tactn = idb.transaction(objStoreName, "readwrite")
		var store = tactn.objectStore(objStoreName)
			for(var obj of arreglo) {
			store.put(obj)
		}
			resolve(idb)
		}

        // Si el evento onupgradeneeded retorna error, entonces se activará el manejador ONERROR
        solicitud.onerror = function (e) {
			alert("Enable to access IndexedDB, " + e.target.errorCode)
		}    
	})
}

// Obtener categorias del indexedDB
function getCategorias(idb) {
	let tactn = idb.transaction("categorias", "readonly")
	let osc = tactn.objectStore("categorias").openCursor()
	osc.onsuccess = function(e) {
		let cursor = e.target.result
		if (cursor) {
            // console.log(`<option>${cursor.value["nombreCategoria"]}</option>`)
            addCategoria(cursor.value["nombreCategoria"]);
			cursor.continue()
		}
	} 
	tactn.oncomplete = function() {
		idb.close();
	};
}

// Agregar categorias al select
function addCategoria(valor){
    const selectElement = document.getElementById('listaCategorias');
    selectElement.insertAdjacentHTML ('beforeend', `<option>${valor}</option>`);
}

// obtener categoria seleccionada
function getCategoria(){
    $("#aplicaciones").html("");
    var categoria = $("#listaCategorias").val();
    getApps(categoria);
}

// Listar apps de la categoria seleccionada
function getApps(categoria){
    var r = indexedDB.open("appstore");
		r.onsuccess = function(e) {
			var idb = r.result
			let tactn = idb.transaction("categorias", "readonly")
			let store = tactn.objectStore("categorias")
			let data = store.get(categoria)

			data.onsuccess = function() {
                let apps = data.result.aplicaciones;
                ListaApp(apps)
                // console.log(categoria, apps,"getapps");
			}
			tactn.oncomplete = function() {
				idb.close()
			}
		}
}

// Detalles las apps
function ListaApp(apps){
    for (let i = 0; i < apps.length; i++) {
        let estrellas = '';
        
        for (let k = 0; k < apps[i].calificacion; k++) {
            estrellas+='<i class="fas fa-star"></i>';
        }
        for (let k = 0; k < 5-apps[i].calificacion; k++) {
            estrellas+='<i class="far fa-star"></i>';
        }
        
        $("#aplicaciones").append(

            `
            <div class="card" data-bs-toggle="modal" data-bs-target="#staticBackdrop" onclick="getApp(${apps[i].codigo})">
                <div class="card-body">
                    <img src="${apps[i].icono}" class="card-img-top" id="miniatura">
                    <h2 class="card-title">${apps[i].nombre}</h2>
                    <p class="card-text">${apps[i].desarrollador}</p>
                    <p class="star">${estrellas}</p>
                    <h2 class="card-title">$ ${apps[i].precio}.00</h2><br>
                </div>
            </div>
            `);
    }

    $("#nueva").html('');
    $("#nueva").append(
        `<div class="card" onclick="mensaje()">
            <div class="card-body nuevaApp">
                <div class="nuevo">
                    <i class="fa-solid fa-circle-plus"></i>
                    <h2 class="card-title">Nueva APP</h2>
                </div>
                
                
                
            </div>
        </div>`);
}

// Obtener app seleccionada
function getApp(codigo){
    // $("#detalles").html("");
    let categoria = $("#listaCategorias").val();
    // console.log(codigo, "detallesapp");
    var r = indexedDB.open("appstore");
		r.onsuccess = function(e) {
			var idb = r.result
			let tactn = idb.transaction("categorias", "readonly")
			let store = tactn.objectStore("categorias")
			let data = store.get(categoria)

			data.onsuccess = function() {
                let app = data.result.aplicaciones.find(app => app.codigo == codigo);
                detallesApp(app);
                console.log(app);
			}
			tactn.oncomplete = function() {
				idb.close()
			}
    }
}

// Detalles de la app seleccionada
function detallesApp(app){

    // Mostrar detalles de la app
    $("#detalles").html('');
    let estrellas = '';
        for (let k = 0; k < app.calificacion; k++) {
            estrellas+='<i class="fas fa-star"></i>';
        }
        for (let k = 0; k < 5-app.calificacion; k++) {
            estrellas+='<i class="far fa-star"></i>';
        }

    let comentarios = '';
    buscar=app.comentarios
    // console.log(buscar);
    for (let x = 0; x < buscar.length; x++) {
        comentarios+=
        `<hr><div class="grid-user">
            <img src="/img/user.webp" class="card-img-top img-user">
            <div>
                <h4 class="card-title">${buscar[x].usuario}</h4>
                <h5>${buscar[x].comentario}</h5>
            </div>
        </div>`;
    }


    
    $("#detalles").append(
        `<div>
            <div id="carouselExampleInterval" class="carousel slide carousel-fade" data-bs-ride="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item active" data-bs-interval="3000">
                        <img src="/img/app-screenshots/1.webp" class="d-block w-100" alt="...">
                    </div>
                    <div class="carousel-item" data-bs-interval="3000">
                        <img src="/img/app-screenshots/2.webp" class="d-block w-100" alt="...">
                    </div>
                    <div class="carousel-item" data-bs-interval="3000">
                        <img src="/img/app-screenshots/3.webp" class="d-block w-100" alt="...">
                </div>
                </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

            <hr>
            <div class="detallesApp grid-detallesApp">
                <div>
                    <img src="${app.icono}" class="card-img-top img-detalle">
                </div>
                <div>
                    <h4 class="card-title">${app.nombre}</h6>
                    <h6>${app.desarrollador}</h6>
                    <h5>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque animi voluptates illo voluptas rerum.</h6>
                    <h4 class="card-title">$ ${app.precio}.00</6><br>
                </div>
                
            </div>

            <hr>
            <div class="estrellas-detalles">
                <p class="star-detalle">${estrellas}</p>
                <h4 class="card-title calificacion">${app.calificacion}.0</h6>
            </div>

            <div>
                <p>${comentarios}</p>
            </div>`
    );

    // Ocultar botones de instalacion
    if (app.instalada == true) {
        $("#instalar").hide();
        $("#instalada").show();
    }else{
        $("#instalar").show();
        $("#instalada").hide();
    }


    // Cambiar color de estrellas
    if (app.calificacion >= 3) {
        $(".estrellas-detalles").css("color", "green");
        $(".calificacion").css("color", "green");
    }else{
        $(".estrellas-detalles").css("color", "red");
        $(".calificacion").css("color", "red");
    }
}

// Mensaje
function mensaje(){
    alert("sin funcionalidad XD");
}


