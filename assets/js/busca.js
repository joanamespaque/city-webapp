let busca = $('#busca');
busca.change(function (event) {
    let response = [];
    cidades.forEach(c => {
        if (!c.nome.toLowerCase().indexOf(busca.val().toLowerCase())) {
            response.push(c);
        }
    });

    event.preventDefault();
});