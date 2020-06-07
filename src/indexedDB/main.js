let request = indexedDB.open("CidadeBD", 1);
let db;
let cidades = [];
let cidade;
window.onload = function () {
    // aqui popula com os dados prontos
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "let indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    request.onsuccess = function (event) {
        db = request.result;
        event.preventDefault();
        listar();
        let id = queryString("id");
        if (id) {
            getCidade(Number(id));
        }
    };

}

request.onupgradeneeded = function (event) {
    let db = event.target.result;

    db.onerror = function (event) {
        console.log('Erro ao carregar o banco.');
    };

    let objectStore = db.createObjectStore('cidade', {
        keyPath: 'id',
        autoIncrement: true
    });
    objectStore.createIndex('nome', 'nome', {
        unique: false
    });
    objectStore.createIndex('estado', 'estado', {
        unique: false
    });
    objectStore.createIndex('ibgeCod', 'ibgeCod', {
        unique: false
    });
    objectStore.createIndex('populacao', 'populacao', {
        unique: false
    });
    objectStore.createIndex('obs', 'obs', {
        unique: false
    });

}




function store(cidade) {
    transaction = db.transaction('cidade', "readwrite");

    transaction.oncomplete = function (event) {
        console.log('Transação readwrite em store() finalizada com sucesso.');
        event.preventDefault();
    };

    transaction.onerror = function (event) {
        console.log('Transação  readwrite em store() finalizada com erro. Erro: ' + event.target.error);
        event.preventDefault();
    };

    let store = transaction.objectStore('cidade');

    if (cidade.id) {
        let request = store.put(cidade);
    } else {
        let request = store.add(cidade);
    }
    request.onerror = function (event) {
        console.log('Ocorreu um erro ao salvar cidade.');
    }

    //quando o registro for incluido com sucesso
    request.onsuccess = function (event) {
        console.log('Cidade salva com sucesso.');
    }

}

function deletar(id) {
    //Abrindo a transação com a object store "cidade"
    transaction = db.transaction('cidade', "readwrite");

    transaction.oncomplete = function (event) {
        console.log('Transação readwrite em deletar() finalizada com sucesso.');
    };

    transaction.onerror = function (event) {
        console.log('Transação  readwrite em deletar() finalizada com erro. Erro: ' + event.target.error);
    };

    //Recuperando a object store para excluir o registro
    let store = transaction.objectStore('cidade');

    //Excluindo o registro pela chave primaria
    let request = store.delete(Number(id));

    //quando ocorrer um erro ao excluir o registro
    request.onerror = function (event) {
        console.log('Ocorreu um erro ao excluir a cidade.');
    }

    //quando o registro for excluído com sucesso
    request.onsuccess = function (event) {
        console.log('cidade excluída com sucesso.');
    }
    document.location.reload(true);
}

function getCidade(id) {
    let transaction = db.transaction('cidade', "readonly");
    // Quando a transação é executada com sucesso
    transaction.oncomplete = function (event) {
        console.log('Transação readonly em get() finalizada com sucesso.');
    };

    // Quando ocorre algum erro na transação
    transaction.onerror = function (event) {
        console.log('Transação  readonly em get() finalizada com erro. Erro: ' + event.target.error);
    };

    let store = transaction.objectStore('cidade');
    let request = store.get(id);
    request.onsuccess = function (event) {
        console.log(event.target.result);
        let nome = event.target.result.nome;
        let obs = event.target.result.obs;
        let ibge = event.target.result.ibgeCod;
        let populacao = event.target.result.populacao;
        let estado = event.target.result.estado;
        ibgeIdValidation(nome.toLowerCase().trim(), estado);
        populacaoValidation(Number(populacao));
        $("#nome").val(nome);
        $("#estado").val(estado);
        $("#obs").val(obs);
        $("#populacao").val(Number(populacao));
        console.log(nome);
        return event.target.result;
    }
}

function buscar(cidade) {
    let transaction = db.transaction('cidade', "readonly");
    // Quando a transação é executada com sucesso
    transaction.oncomplete = function (event) {
        console.log('Transação readonly em buscar() finalizada com sucesso.');
    };

    // Quando ocorre algum erro na transação
    transaction.onerror = function (event) {
        console.log('Transação  readonly em buscar() finalizada com erro. Erro: ' + event.target.error);
    };


    let store = transaction.objectStore('cidade');
    let index = store.index("nome_estado");

    //filtra as cidades com nome e estado referentes ao nome e estado da cidade passada como parametro
    let filtro = IDBKeyRange.only([cidade.nome, cidade.estado]);

    let request = index.openCursor(filtro);

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            console.log(cursor.value);
            cursor.continue();
        }
    }
}


function listar() {
    console.log(db);
    let transaction = db.transaction('cidade', 'readonly');

    transaction.oncomplete = function () {
        popularLista()
    };

    transaction.onerror = function (event) {
        console.log('Transação  readonly em listar() finalizada com erro. Erro: ' + event.target.error);
    };

    let store = transaction.objectStore('cidade');
    let cursor = store.openCursor();
    cursor.onsuccess = e => {
        let current = e.target.result;
        if (current) {
            cidades.push(current.value);
            current.continue();
        }
    };
    cursor.onerror = e => {
        console.log('Error:' + e.target.error.name);
    };
}

function popularLista() {
    let div = $('.grid');
    cidades.forEach(element => {
        let item = $('<div>').addClass('item');
        let infos = [
            $('<div>').addClass("info").append(element.nome + "/" + element.estado),
            $('<div>').addClass("info").append("População estimada: " + element.populacao),
            $('<div>').addClass("info").append("Código IBGE: " + element.ibgeCod)
        ];
        item.append(infos);
        let divButton = $('<div>').addClass("mais");
        divButton.append($('<button>').addClass('btn').append('Ver mais'));
        let divMenu = $('<div>').addClass("menu");
        divMenu.append($('<div>').addClass('editar item-icon').attr({
            id: element.id
        }))
        divMenu.append($('<div>').addClass('deletar item-icon').attr({
            id: element.id
        }))
        item.append(divButton);
        item.append(divMenu);
        div.append(item);
    });
}

function queryString(parameter) {
    let loc = location.search.substring(1, location.search.length);
    let param_value = false;
    let params = loc.split("&");
    for (i = 0; i < params.length; i++) {
        param_name = params[i].substring(0, params[i].indexOf('='));
        if (param_name == parameter) {
            param_value = params[i].substring(params[i].indexOf('=') + 1)
        }
    }
    if (param_value) {
        return param_value;
    } else {
        return undefined;
    }
}