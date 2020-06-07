const urlEstados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const urlCidades = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
let estados = [];
let ibgedata = [];
$(':input[type="submit"]').prop('disabled', true);
let validacao = {
    "nome": false,
    "estado": false,
    "ibge": false,
    "populacao": false
}
fetch(urlEstados).then(r => r.json())
    .then(json => {
        for (let i = 0; i < json.length; i++) {
            estados.push(json[i].sigla);
        }
        estados.sort();
        estados.forEach(element => {
            $('<option/>', {
                'value': element,
                'text': element
            }).appendTo('#estado')
        });
    });
fetch(urlCidades).then(r => r.json())
    .then(json => {
        json.forEach(element => {
            ibgedata.push({
                "id": element.id,
                "nome": element.nome.toLowerCase(),
                "uf": element.microrregiao.mesorregiao.UF.sigla
            });
        });

    });

$('#estado').change(function () {
    $('#estado option[value="selecione"]').remove();
    if ($('#nome').val() === '') {
        $('#msgNome').text('Por favor, preencha esse campo também.');
        $('#msgNome').addClass('red');
    } else {
        ibgeIdValidation();
        console.log("validacao...");
    }
});

$('#nome').change(function () {
    if ($('#estado option:selected').val() !== 'selecione') {
        ibgeIdValidation();
        console.log("validacao...");
    }

});


function ibgeIdValidation() {
    let valid = false;
    ibgedata.forEach(element => {
        if ((element.nome === $('#nome').val().toLowerCase().trim()) && (element.uf === $('#estado option:selected').val())) {
            console.log("entrou no if");
            $('#ibgecod').val(element.id);
            $('#msgIBGE').text('Código encontrado.');
            $('#msgIBGE').addClass('green');
            validacao.nome = true;
            validacao.estado = true;
            validacao.ibge = true;
            if (validacao.nome && validacao.estado && validacao.populacao && validacao.ibge) {
                $('input[type="submit"]').removeClass('disabled');
                $(':input[type="submit"]').prop('disabled', false);
            }
            valid = true;
        }
    });
    if ($('#ibgecod').val() === '' || !valid) {
        $('#ibgecod').val('Código não encontrado para essas informações. Tente novamente.');
        $('#msgIBGE').empty();
        validacao.nome = false;
        validacao.estado = false;
        validacao.ibge = false;

    }
}

$('#populacao').change(function () {
    if (Number($('#populacao').val()) <= 0) {
        ($('#msgPopulacao')).text('Esse número precisa ser maior que 0.')
        $('#msgPopulacao').addClass('red');
    } else {
        validacao.populacao = true;
        $('#msgPopulacao').empty();
        if (validacao.nome && validacao.estado && validacao.populacao && validacao.ibge) {
            $('input[type="submit"]').removeClass('disabled');
            $(':input[type="submit"]').prop('disabled', false);
        }

    }
});

$('#cidade-form').submit(function (event) {
    let nome = $('#nome').val();
    let estado = $('#estado').val();
    let populacao = Number($('#populacao').val());
    let ibge = $('#ibgecod').val();
    let obs = $('#obs').val();
    let cidade = {
        "nome": nome,
        "estado": estado,
        "populacao": populacao,
        "obs": obs,
        "ibgeCod": ibge
    }
    store(cidade);
    event.preventDefault();
    window.location.href = "lista.html";
});