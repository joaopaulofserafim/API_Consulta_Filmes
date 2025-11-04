const API_KEY = '7a4602bccbde8556e251c7ef6e043ab5'; // API KEY
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// ====== BUSCAR ATORES ======
async function buscarAtores() {
    const nome = document.getElementById('atorInput').value.trim(); // tira espaços em branco
    const status = document.getElementById('statusAtores'); // pega o valor 
    const resultado = document.getElementById('resultadoAtores'); // pega o valor
    resultado.innerHTML = ''; // limpa resultados anteriores
    if (!nome) {
        status.textContent = 'Digite um nome para buscar.'; // se n escrever nada, printa isso na div resultado
        return;
    }
    status.textContent = 'Buscando...';  // else if

    try {
        const res = await fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&language=pt-BR&query=${nome}`); // fzd uma requisição com minha chave da API e o nome digitado
        const data = await res.json(); // passa para json - array

        if (data.results.length === 0) {
            status.textContent = 'Nenhum ator encontrado.'; 
            return;
        }

        status.textContent = '';
        resultado.innerHTML = data.results.map(ator => //pega o resultado e cria um card com tags HTML 
`  
            <div class="card">
                <img src="${ator.profile_path ? IMG_BASE + ator.profile_path : 'https://via.placeholder.com/300x450'}" alt="${ator.name}">
                <h3>${ator.name}</h3>
                <p>Popularidade: ${ator.popularity.toFixed(1)}</p>
            </div>
        `).join('');
    } catch (error) { // default praticamente
        status.textContent = 'Erro ao buscar atores.';
    }
}

// ====== CARREGAR GÊNEROS ======
async function carregarGeneros() {
    const select = document.getElementById('generoSelect');
    try {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);// fzd uma requisição com minha chave da API e o nome digitado
        const data = await res.json();// passa para json array
        select.innerHTML = '<option value="">Gênero</option>' +  // usa o select do html e adiciona as opções
            data.genres.map(g => `<option value="${g.id}">${g.name}</option>`).join(''); // acha e cria option
    } catch (error) {
        select.innerHTML = '<option>Erro ao carregar gêneros</option>'; // usa o select do html e adiciona as opções
    }
}
carregarGeneros();

// ====== FILTRAR FILMES ======
async function filtrarFilmes() {
    const genero = document.getElementById('generoSelect').value;          //
    const ano = document.getElementById('anoInput').value;                 //
    const idioma = document.getElementById('idiomaSelect').value;          // pega os valores 
    const status = document.getElementById('statusFilmes');                //
    const resultado = document.getElementById('resultadoFilmes');          //
    resultado.innerHTML = '';
    status.textContent = 'Buscando filmes...';

    const url = new URL(`${BASE_URL}/discover/movie`);  // lista de filmes completa do TMDB
    url.search = new URLSearchParams({
        api_key: API_KEY,
        language: 'pt-BR',
        with_genres: genero,
        primary_release_year: ano,                // faz uma busa com um filto baseado nas respostas dos campos que foram pegados os valores
        with_original_language: idioma
    });

    try {
        const res = await fetch(url); // requisição novamente
        const data = await res.json(); // resposta em json

        if (data.results.length === 0) {
            status.textContent = 'Nenhum filme encontrado com esses filtros.';
            return;
        }

        status.textContent = ''; //clear do campo
        resultado.innerHTML = data.results.map(filme => //com tags HTML ele adiociona uma escuta no elemento DIV e chama a classe mostrarDetalhes com o ID de parametro
            `
            <div class="card" onclick="mostrarDetalhes(${filme.id})">
                <img src="${filme.poster_path ? IMG_BASE + filme.poster_path : 'https://via.placeholder.com/300x450'}" alt="${filme.title}">
                <h3>${filme.title}</h3>
                <p>Nota: ${filme.vote_average.toFixed(1)}</p>
            </div>
        `).join('');
    } catch (error) { // default
        status.textContent = 'Erro ao buscar filmes.';
    }
}

// ====== DETALHES DO FILME ======
async function mostrarDetalhes(id) {
    const status = document.getElementById('statusDetalhes');   // Elementos para status e detalhes
    const detalhes = document.getElementById('detalhesFilme');
    status.textContent = 'Carregando detalhes...';  
    detalhes.innerHTML = '';

    try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits`); // requisição id fo filme 
        const filme = await res.json(); // resposta em json

        status.textContent = '';
        detalhes.innerHTML = //  card com tas html com as respostas setadas nas variaveis acima - so printa
        `
            <div class="card">
                <img src="${filme.poster_path ? IMG_BASE + filme.poster_path : 'https://via.placeholder.com/300x450'}" alt="${filme.title}">
                <h3>${filme.title}</h3>
                <p><strong>Lançamento:</strong> ${filme.release_date}</p>
                <p><strong>Nota:</strong> ${filme.vote_average.toFixed(1)} / 10</p>
                <p><strong>Gêneros:</strong> ${filme.genres.map(g => g.name).join(', ')}</p>
                <p><strong>Sinopse:</strong> ${filme.overview || 'Sem descrição disponível.'}</p>
                <p><strong>Elenco principal:</strong> ${filme.credits.cast.slice(0, 5).map(a => a.name).join(', ')}</p>
            </div>
        `;
    } catch (error) {
        status.textContent = 'Erro ao carregar detalhes.'; // default caso haja erro
    }
}



const formCrud = document.getElementById('formCrud');
const listaRegistros = document.getElementById('listaRegistrosCrud');

function carregarRegistros() {
    const registros = JSON.parse(localStorage.getItem('crudRegistros')) || [];
    listaRegistros.innerHTML = '';

    if (registros.length === 0) {
        listaRegistros.innerHTML = '<p>Nenhum registro salvo ainda.</p>';
        return;
    }

    registros.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('registro-item');
        div.innerHTML = `
            <strong>${item.nome}</strong>
            <span>${item.email}</span>
            <span>Produto: ${item.produto}</span>
            <button onclick="editarRegistro(${index})">Editar</button>
            <button  onclick="excluirRegistro(${index})">Excluir</button>
        `;
        listaRegistros.appendChild(div);
    });
}

formCrud.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('crudNome').value.trim();
    const email = document.getElementById('crudEmail').value.trim();
    const produto = document.getElementById('crudProduto').value.trim();
    const identificador = document.getElementById('crudIdentificador').value;

    if (!nome || !email || !produto) {
        alert('Preencha todos os campos!');
        return;
    }

    let registros = JSON.parse(localStorage.getItem('crudRegistros')) || [];

    if (formCrud.dataset.editIndex) {
        registros[formCrud.dataset.editIndex] = { nome, email, produto, identificador };
        delete formCrud.dataset.editIndex;
    } else {
        registros.push({ nome, email, produto, identificador });
    }

    localStorage.setItem('crudRegistros', JSON.stringify(registros));
    formCrud.reset();
    carregarRegistros();
});


function excluirRegistro(index) {
    let registros = JSON.parse(localStorage.getItem('crudRegistros')) || [];
    registros.splice(index, 1);
    localStorage.setItem('crudRegistros', JSON.stringify(registros));
    carregarRegistros();
}


function editarRegistro(index) {
    let registros = JSON.parse(localStorage.getItem('crudRegistros')) || [];
    const item = registros[index];

    document.getElementById('crudNome').value = item.nome;
    document.getElementById('crudEmail').value = item.email;
    document.getElementById('crudProduto').value = item.produto;

    formCrud.dataset.editIndex = index;
}

document.addEventListener('DOMContentLoaded', carregarRegistros);
