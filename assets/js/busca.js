let busca = $('#busca');
busca.change(function (event) {
    let response = new Array();
    cidades.forEach(c => {
        if (!c.nome.toLowerCase().indexOf(busca.val().toLowerCase())) {
            response.push(c);
        }
    });

    let div = $('.cidades');
    div.empty();

    response.forEach(r => {
        let nome = r.nome.toLowerCase().trim().split(" ").join("%20");
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${nome},${r.estado},brazil&appid=3b0ddeb49055a4d5464ad63e1dba073c&units=metric`;

        fetch(url).then(result => result.json()).then(data => {
            let json = {
                icon: data.weather[0].icon,
                descricao: data.weather[0].description,
                temp: data.main.temp,
                min: data.main.temp_min,
                max: data.main.temp_max,
                feels: data.main.feels_like
            };
            let divCidade = $('<div>').addClass("cidade");
            let link = $('<a>').attr('href', 'detalhes.html?' + r.id);
            let h2 = $('<h2>').addClass('nome').text(r.nome + " / " + r.estado);
            let ibge = $('<p>').text("Código IBGE: " + r.ibgeCod);
            let populacao = $('<p>').text("População estimada: " + r.populacao);
            let h3 = $('<h3>').addClass("clima").text("O clima nesse momento:");
            let icon = $('<img>').attr('src', `http://openweathermap.org/img/wn/${json.icon}@2x.png`);
            let temp = $('<p>').text("Temperatura atual: " + json.temp + "°C");
            let min = $('<p>').text("Temperatura mínima: " + json.min + "°C");
            let max = $('<p>').text("Temperatura máxima: " + json.max + "°C");
            let feels = $('<p>').text("Sensação térmica: " + json.feels + "°C");
            let desc = $('<p>').text(json.descricao);
            link.append([h2, ibge, populacao, h3, icon, desc, temp, max, min, feels]);
            divCidade.append(link);
            div.append(divCidade);

        });
    });

    event.preventDefault();
});