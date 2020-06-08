let db;
let cidades = [];
let cidade;
window.onload = function () {
    let request = indexedDB.open("CidadeBD", 1);
    // aqui popula com os dados prontos
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "let indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    request.onsuccess = function (event) {
        db = request.result;
        listar();
        let id = queryString("id");
        if (id) {
            getCidade(Number(id));
        }
        let idBusca = queryString("idBusca");
        if (idBusca) {
            getDetalhes(Number(idBusca));
            var intervalo = window.setInterval(function () {
                getDetalhes(Number(idBusca));
            }, 50000);
        }
        event.preventDefault();
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

function getDetalhes(id) {
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
        $('#maininfo').empty();
        let divcidade = $('<div>').addClass('infocidade');
        let h1 = $('<h1>').text(event.target.result.nome + " / " + event.target.result.estado);
        let ibge = $('<h3>').text("Código do IBGE: " + event.target.result.ibgeCod);
        let pop = $('<h3>').text('População estimada: ' + event.target.result.populacao);
        let obs = $('<p>');

        if (event.target.result.obs === "") {
            obs.text("Nenhuma observação informada.");
        } else {
            obs.text("Observações: " + event.target.result.obs);
        }

        divcidade.append([h1, ibge, pop, obs]);

        let divclima = $('<div>').addClass("infoclima");
        let title = $('<h2>').text("Detalhes sobre o clima agora:");
        let nome = event.target.result.nome.toLowerCase().trim().split(" ").join("%20");
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${nome},${event.target.result.estado},brazil&appid=3b0ddeb49055a4d5464ad63e1dba073c&units=metric`;

        fetch(url).then(result => result.json()).then(data => {
            let json = {
                icon: data.weather[0].icon,
                descricao: data.weather[0].description,
                temp: data.main.temp,
                min: data.main.temp_min,
                max: data.main.temp_max,
                feels: data.main.feels_like
            };

            let icon = $('<img>').attr('src', `http://openweathermap.org/img/wn/${json.icon}@2x.png`);
            let temp = $('<p>').text("Temperatura atual: " + json.temp + "°C");
            let min = $('<p>').text("Temperatura mínima: " + json.min + "°C");
            let max = $('<p>').text("Temperatura máxima: " + json.max + "°C");
            let feels = $('<p>').text("Sensação térmica: " + json.feels + "°C");
            let desc = $('<p>').text(json.descricao);
            divclima.append([icon, desc, temp, max, min, feels]);

        });
        divclima.append([title]);
        $('#maininfo').append([divcidade, divclima]);
        return event.target.result;
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
            $('<div>').addClass("info").append(element.nome + " / " + element.estado),
            $('<div>').addClass("info").append("População estimada: " + element.populacao),
            $('<div>').addClass("info").append("Código IBGE: " + element.ibgeCod)
        ];
        item.append(infos);
        let divButton = $('<div>').addClass("mais");
        divButton.append($('<button>').addClass('btn detalhes').append('Ver mais').attr('id', element.id));
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