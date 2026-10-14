let tabuleiro = ["", "", "", "", "", "", "", "", ""];
const simboloJ1 = "X";
const simboloJ2 = "O";
let jogoAcabou = false;
let modoJogo = "pvc";
let nivelDificuldade = "dificil";

let nomeJ1 = "Jogador 1";
let nomeJ2 = "Computador";

let turnoAtual = simboloJ1;
let quemComeca = simboloJ1;

let placar = { j1: 0, empate: 0, j2: 0 };

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function tocarTom(frequencia, duracao, tipoOnda = "sine") {
    const oscilador = audioContext.createOscillator();
    const ganho = audioContext.createGain();

    oscilador.type = tipoOnda;
    oscilador.frequency.value = frequencia;

    ganho.gain.setValueAtTime(0.2, audioContext.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duracao);

    oscilador.connect(ganho);
    ganho.connect(audioContext.destination);

    oscilador.start();
    oscilador.stop(audioContext.currentTime + duracao);
}

function tocarSomJogada() {
    tocarTom(440, 0.1);
}

function tocarSomVitoria() {
    tocarTom(523, 0.15);
    setTimeout(() => tocarTom(659, 0.15), 150);
    setTimeout(() => tocarTom(784, 0.25), 300);
}

function tocarSomEmpate() {
    tocarTom(220, 0.3, "triangle");
}

const telaMenu = document.getElementById("telaMenu");
const telaNivel = document.getElementById("telaNivel");
const telaConfig = document.getElementById("telaConfig");
const telaJogo = document.getElementById("telaJogo");

const btnEscolherPvc = document.getElementById("btnEscolherPvc");
const btnEscolherPvp = document.getElementById("btnEscolherPvp");

const btnNivelMedio = document.getElementById("btnNivelMedio");
const btnNivelDificil = document.getElementById("btnNivelDificil");

const tituloConfig = document.getElementById("tituloConfig");
const inputNome1 = document.getElementById("nomeJogador1");
const inputNome2 = document.getElementById("nomeJogador2");
const botaoComecar = document.getElementById("botaoComecar");

const tabuleiroWrapperEl = document.getElementById("tabuleiroWrapper");
const tabuleiroEl = document.getElementById("tabuleiro");
const mensagemEl = document.getElementById("mensagem");
const botaoReiniciar = document.getElementById("botaoReiniciar");
const botaoVoltarMenu = document.getElementById("botaoVoltarMenu");
const placarNome1El = document.getElementById("placarNome1");
const placarNome2El = document.getElementById("placarNome2");
const placarPontos1El = document.getElementById("placarPontos1");
const placarEmpateEl = document.getElementById("placarEmpate");
const placarPontos2El = document.getElementById("placarPontos2");

const overlayVitoriaEl = document.getElementById("overlayVitoria");
const canvasConfeteEl = document.getElementById("canvasConfete");
const textoVitoriaEl = document.getElementById("textoVitoria");

let confeteAnimando = false;

function mostrarTela(tela) {
    [telaMenu, telaNivel, telaConfig, telaJogo].forEach(t => t.classList.add("escondido"));
    tela.classList.remove("escondido");
}

btnEscolherPvc.addEventListener("click", () => {
    modoJogo = "pvc";
    mostrarTela(telaNivel);
});

btnEscolherPvp.addEventListener("click", () => {
    modoJogo = "pvp";
    tituloConfig.textContent = "Digite os nomes dos jogadores";
    inputNome2.classList.remove("escondido");
    mostrarTela(telaConfig);
});

btnNivelMedio.addEventListener("click", () => {
    nivelDificuldade = "medio";
    tituloConfig.textContent = "Digite seu nome";
    inputNome2.classList.add("escondido");
    mostrarTela(telaConfig);
});

btnNivelDificil.addEventListener("click", () => {
    nivelDificuldade = "dificil";
    tituloConfig.textContent = "Digite seu nome";
    inputNome2.classList.add("escondido");
    mostrarTela(telaConfig);
});

botaoComecar.addEventListener("click", () => {
    const valor1 = inputNome1.value.trim();
    nomeJ1 = valor1 === "" ? "Jogador 1" : valor1;

    if (modoJogo === "pvp") {
        const valor2 = inputNome2.value.trim();
        nomeJ2 = valor2 === "" ? "Jogador 2" : valor2;
    } else {
        nomeJ2 = nivelDificuldade === "medio" ? "Computador (Médio)" : "Computador (Difícil)";
    }

    placarNome1El.textContent = nomeJ1;
    placarNome2El.textContent = nomeJ2;

    placar = { j1: 0, empate: 0, j2: 0 };
    placarPontos1El.textContent = 0;
    placarEmpateEl.textContent = 0;
    placarPontos2El.textContent = 0;

    quemComeca = simboloJ1;
    mostrarTela(telaJogo);
    iniciarPartida();
});

botaoVoltarMenu.addEventListener("click", () => {
    esconderVitoria();
    mostrarTela(telaMenu);
});

function criarTabuleiro() {
    tabuleiroEl.innerHTML = "";
    tabuleiro.forEach((valor, index) => {
        const celula = document.createElement("div");
        celula.classList.add("celula");
        if (valor === "X") celula.classList.add("x");
        if (valor === "O") celula.classList.add("o");
        celula.textContent = valor;
        celula.addEventListener("click", () => jogarNaCelula(index));
        tabuleiroEl.appendChild(celula);
    });
}

function jogarNaCelula(index) {
    if (tabuleiro[index] !== "" || jogoAcabou) return;
    if (modoJogo === "pvc" && turnoAtual !== simboloJ1) return;

    tabuleiro[index] = turnoAtual;
    tocarSomJogada();
    criarTabuleiro();

    if (verificarFimDeJogo(turnoAtual)) return;

    turnoAtual = turnoAtual === simboloJ1 ? simboloJ2 : simboloJ1;

    if (modoJogo === "pvc" && turnoAtual === simboloJ2) {
        mensagemEl.textContent = "Computador pensando...";
        setTimeout(jogadaComputador, 600);
    } else {
        atualizarMensagemTurno();
    }
}

function jogadaComputador() {
    const jogada = nivelDificuldade === "medio"
        ? escolherJogadaAleatoria()
        : encontrarMelhorJogada();

    tabuleiro[jogada] = simboloJ2;
    tocarSomJogada();
    criarTabuleiro();

    if (verificarFimDeJogo(simboloJ2)) return;

    turnoAtual = simboloJ1;
    atualizarMensagemTurno();
}

function escolherJogadaAleatoria() {
    const posicoesVazias = tabuleiro
        .map((valor, index) => (valor === "" ? index : null))
        .filter(index => index !== null);

    return posicoesVazias[Math.floor(Math.random() * posicoesVazias.length)];
}

function encontrarMelhorJogada() {
    let melhorPontuacao = -Infinity;
    let melhorIndex = -1;

    for (let i = 0; i < tabuleiro.length; i++) {
        if (tabuleiro[i] === "") {
            tabuleiro[i] = simboloJ2;
            const pontuacao = minimax(tabuleiro, 0, false);
            tabuleiro[i] = "";

            if (pontuacao > melhorPontuacao) {
                melhorPontuacao = pontuacao;
                melhorIndex = i;
            }
        }
    }
    return melhorIndex;
}

function minimax(tab, profundidade, estaMaximizando) {
    if (verificarVitoria(simboloJ2)) return 10 - profundidade;
    if (verificarVitoria(simboloJ1)) return profundidade - 10;
    if (!tab.includes("")) return 0;

    if (estaMaximizando) {
        let melhorPontuacao = -Infinity;
        for (let i = 0; i < tab.length; i++) {
            if (tab[i] === "") {
                tab[i] = simboloJ2;
                const pontuacao = minimax(tab, profundidade + 1, false);
                tab[i] = "";
                melhorPontuacao = Math.max(pontuacao, melhorPontuacao);
            }
        }
        return melhorPontuacao;
    } else {
        let piorPontuacao = Infinity;
        for (let i = 0; i < tab.length; i++) {
            if (tab[i] === "") {
                tab[i] = simboloJ1;
                const pontuacao = minimax(tab, profundidade + 1, true);
                tab[i] = "";
                piorPontuacao = Math.min(pontuacao, piorPontuacao);
            }
        }
        return piorPontuacao;
    }
}

function atualizarMensagemTurno() {
    const nome = turnoAtual === simboloJ1 ? nomeJ1 : nomeJ2;
    mensagemEl.textContent = `Vez de ${nome} (${turnoAtual})`;
}

function encontrarCombinacaoVencedora(jogador) {
    const combinacoes = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return combinacoes.find(combinacao =>
        combinacao.every(index => tabuleiro[index] === jogador)
    );
}

function destacarVitoria(combinacao) {
    const celulas = tabuleiroEl.querySelectorAll(".celula");
    combinacao.forEach(index => {
        celulas[index].classList.add("vencedora");
    });
}

function iniciarConfete() {
    canvasConfeteEl.width = tabuleiroWrapperEl.offsetWidth;
    canvasConfeteEl.height = tabuleiroWrapperEl.offsetHeight;
    const ctx = canvasConfeteEl.getContext("2d");

    const cores = ["#f38ba8", "#a6e3a1", "#89b4fa", "#f9e2af", "#cba6f7"];
    const particulas = [];
    for (let i = 0; i < 120; i++) {
        particulas.push({
            x: Math.random() * canvasConfeteEl.width,
            y: -20 - Math.random() * canvasConfeteEl.height,
            tamanho: 6 + Math.random() * 6,
            cor: cores[Math.floor(Math.random() * cores.length)],
            velocidadeY: 2 + Math.random() * 3,
            velocidadeX: -1 + Math.random() * 2,
            rotacao: Math.random() * 360,
            velocidadeRotacao: -6 + Math.random() * 12
        });
    }

    confeteAnimando = true;
    const tempoInicio = Date.now();

    function animar() {
        ctx.clearRect(0, 0, canvasConfeteEl.width, canvasConfeteEl.height);
        particulas.forEach(p => {
            p.y += p.velocidadeY;
            p.x += p.velocidadeX;
            p.rotacao += p.velocidadeRotacao;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotacao * Math.PI) / 180);
            ctx.fillStyle = p.cor;
            ctx.fillRect(-p.tamanho / 2, -p.tamanho / 2, p.tamanho, p.tamanho * 0.6);
            ctx.restore();
        });

        if (confeteAnimando && Date.now() - tempoInicio < 3000) {
            requestAnimationFrame(animar);
        } else {
            ctx.clearRect(0, 0, canvasConfeteEl.width, canvasConfeteEl.height);
        }
    }

    animar();
}

function mostrarVitoria(nomeVencedor) {
    textoVitoriaEl.textContent = `🎉 ${nomeVencedor} VENCEU! 🎉`;
    overlayVitoriaEl.classList.remove("escondido");
    iniciarConfete();
}

function esconderVitoria() {
    confeteAnimando = false;
    overlayVitoriaEl.classList.add("escondido");
}

function verificarFimDeJogo(jogador) {
    if (verificarVitoria(jogador)) {
        const combinacao = encontrarCombinacaoVencedora(jogador);
        destacarVitoria(combinacao);
        tocarSomVitoria();

        if (jogador === simboloJ1) {
            mensagemEl.textContent = `${nomeJ1} venceu!`;
            placar.j1++;
            placarPontos1El.textContent = placar.j1;
            mostrarVitoria(nomeJ1);
        } else {
            mensagemEl.textContent = `${nomeJ2} venceu!`;
            placar.j2++;
            placarPontos2El.textContent = placar.j2;
            mostrarVitoria(nomeJ2);
        }
        jogoAcabou = true;
        return true;
    }

    if (!tabuleiro.includes("")) {
        mensagemEl.textContent = "Empate!";
        tocarSomEmpate();
        placar.empate++;
        placarEmpateEl.textContent = placar.empate;
        jogoAcabou = true;
        return true;
    }

    return false;
}

function verificarVitoria(jogador) {
    const combinacoes = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return combinacoes.some(combinacao =>
        combinacao.every(index => tabuleiro[index] === jogador)
    );
}

function iniciarPartida() {
    tabuleiro = ["", "", "", "", "", "", "", "", ""];
    jogoAcabou = false;
    turnoAtual = quemComeca;

    esconderVitoria();
    criarTabuleiro();

    if (modoJogo === "pvc" && turnoAtual === simboloJ2) {
        mensagemEl.textContent = "Computador começa...";
        setTimeout(jogadaComputador, 600);
    } else {
        atualizarMensagemTurno();
    }
}

botaoReiniciar.addEventListener("click", () => {
    quemComeca = quemComeca === simboloJ1 ? simboloJ2 : simboloJ1;
    iniciarPartida();
});