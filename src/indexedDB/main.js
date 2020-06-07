let request = indexedDB.open("CidadeBD", 1);
let db;

request.onsuccess = function (event) {
    db = request.result;
};

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
    //Abrindo a transação com a object store "cidade"
    transaction = db.transaction('cidade', "readwrite");

    // Quando a transação é executada com sucesso
    transaction.oncomplete = function (event) {
        console.log('Transação readwrite em store() finalizada com sucesso.');
        event.preventDefault();
    };

    // Quando ocorre algum erro na transação
    transaction.onerror = function (event) {
        console.log('Transação  readwrite em store() finalizada com erro. Erro: ' + event.target.error);
        event.preventDefault();
    };

    let store = transaction.objectStore('cidade');

    if (cidade.id) {
        // se o objeto tem id, editar
        let request = store.get(cidade.id);
    } else {
        // se não, adicionar

        //Recuperando a object store para excluir o registro

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

function deletar(cidade) {
    //Abrindo a transação com a object store "cidade"
    transaction = db.transaction('cidade', "readwrite");

    // Quando a transação é executada com sucesso
    transaction.oncomplete = function (event) {
        console.log('Transação readwrite em deletar() finalizada com sucesso.');
    };

    // Quando ocorre algum erro na transação
    transaction.onerror = function (event) {
        console.log('Transação  readwrite em deletar() finalizada com erro. Erro: ' + event.target.error);
    };

    //Recuperando a object store para excluir o registro
    let store = transaction.objectStore('cidade');

    //Excluindo o registro pela chave primaria
    let request = store.delete(cidade.id);

    //quando ocorrer um erro ao excluir o registro
    request.onerror = function (event) {
        console.log('Ocorreu um erro ao excluir a cidade.');
    }

    //quando o registro for excluído com sucesso
    request.onsuccess = function (event) {
        console.log('cidade excluída com sucesso.');
    }
}

function get(id) {
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
    let request = store.get(4);
    request.onsuccess = function (event) {
        console.log(event.target.result);
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
    let transaction = db.transaction(['cidade'], 'readonly');

    transaction.oncomplete = function (event) {
        console.log('Transação readonly em listar() finalizada com sucesso.');
    };

    transaction.onerror = function (event) {
        console.log('Transação  readonly em listar() finalizada com erro. Erro: ' + event.target.error);
    };

    let cidades = transaction.objectStore('cidade');
    cidades.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            console.log(cursor);

            cursor.continue();
        } else {
            console.log('Entries all displayed.');
        }
    };
}


window.onload = function () {
    // aqui popula com os dados prontos
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "let indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

}