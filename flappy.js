function novoElemento(tagname, classname){
    const elem = document.createElement(tagname)
    elem.className = classname

    return elem
}

//! Criando as Barreiras do jogo (cada barreira individualmente)
function Barreira(reversa = false){ 
    this.barreira = novoElemento('div', 'barreira')
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.barreira.appendChild(reversa ? corpo : borda)
    this.barreira.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//! Definindo pares de barreiras
function ParDeBarreiras(altura, abertura, x){
    this.parDeBarreiras = novoElemento('div', 'par-de-barreiras')
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.parDeBarreiras.appendChild(this.superior.barreira)
    this.parDeBarreiras.appendChild(this.inferior.barreira)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.parDeBarreiras.style.left.split('px')[0]) 
    this.setX = x => this.parDeBarreiras.style.left = `${x}px`
    this.getLargura = () => this.parDeBarreiras.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

//! Controlando a exibição das barreiras
function Barreiras(alturaDoJogo, larguraDoJogo, aberturaEntreBarreiras, espacoXentreAsBarreiras, notificarPonto){

    this.pares = [
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, larguraDoJogo), 
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, larguraDoJogo + espacoXentreAsBarreiras),
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, larguraDoJogo + espacoXentreAsBarreiras * 2),
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, larguraDoJogo + espacoXentreAsBarreiras * 3)
    ]

    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if(par.getX() < -par.getLargura()){
                par.setX (par.getX()+ espacoXentreAsBarreiras * this.pares.length)
            }

            const meioDoJogo = larguraDoJogo / 2
            const cruzouOmeio = par.getX() + deslocamento >= meioDoJogo 
                && par.getX() < meioDoJogo
            cruzouOmeio && notificarPonto()
        })
    }
}

//! Criando a funcionaliade do pássaro
function Passaro(alturaDoJogo){
    let voando = false
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = './imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.addEventListener('keydown', e => {
        voando = true
    })
    window.addEventListener('keyup', e => {
        voando = false
    })

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaximaDeVoo = alturaDoJogo - this.elemento.clientHeight

        if (novoY <= 0){
            this.setY(0)
        } else if(novoY > alturaMaximaDeVoo){
            this.setY(alturaMaximaDeVoo)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaDoJogo / 2)
}

//! Croando uma função responsável por controlar a pontuação
function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

//! verificando colisão
function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(par => {
        if(!colidiu){
            const superior = par.superior.barreira
            const inferior = par.inferior.barreira
            colidiu = estaoSobrepostos(passaro.elemento, superior) ||  estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

//! Criando a função  que define o jogo
function FlappyBird(){
    let pontos = 0
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const alturaDoJogo = areaDoJogo.clientHeight
    const larguraDoJogo = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(alturaDoJogo, larguraDoJogo, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(alturaDoJogo)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.parDeBarreiras))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()