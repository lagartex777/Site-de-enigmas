// script.js - lógica dos puzzles
const puzzles = [
  {
    id: "morse-1",
    title: "SOS em Morse",
    type: "morse",
    prompt: "... --- ... / -.. . ...- .- ... -.. . / --. .-. .- -.-. .. .- ...",
    hint: "Pontos separados por barras representam palavras.",
    answer: "SOS DEVASDE GRACIAS" // intentionally spaced uppercase
  },
  {
    id: "binary-1",
    title: "Binário simples",
    type: "binary",
    prompt: "01001000 01100101 01101100 01101100 01101111",
    hint: "Cada grupo é um caractere ASCII em 8 bits.",
    answer: "HELLO"
  },
  {
    id: "b64-1",
    title: "Base64",
    type: "base64",
    prompt: "U0lOS19UT0dURU5D",
    hint: "Base64 é frequentemente usado para codificar pequenos textos.",
    answer: "SINK_TOGTENC"
  },
  {
    id: "caesar-1",
    title: "Cifra de César",
    type: "caesar",
    prompt: "Ymnx nx f xjqj",
    hint: "Desloque 5 posições para trás.",
    answer: "THIS IS A SECRET"
  },
  {
    id: "osint-1",
    title: "Pequeno desafio OSINT",
    type: "osint",
    prompt: "Uma conta pública no Twitter usa o handle @NASA. Pesquise a data do primeiro lançamento do foguete do programa Artemis I (formato YYYY-MM-DD). (ligação externa necessária)",
    hint: "Procure fontes oficiais como sites de agências espaciais ou notícias técnicas.",
    answer: "" // For OSINT puzzle, accept non-empty answer; user must look up externally
  }
]

// helpers
function decodeMorse(morse){
  const map = {
    ".-":"A","-...":"B","-.-.":"C","-..":"D",".":"E","..-.":"F","--.":"G","....":"H","..":"I",
    ".---":"J","-.-":"K",".-..":"L","--":"M","-.":"N","---":"O",".--.":"P","--.-":"Q",".-.":"R",
    "...":"S","-":"T","..-":"U","...-":"V",".--":"W","-..-":"X","-.--":"Y","--..":"Z",
    "-----":"0",".----":"1","..---":"2","...--":"3","....-":"4",".....":"5","-....":"6","--...":"7","---..":"8","----.":"9",
    "/":" "
  }
  return morse.trim().split(" ").map(s=>map[s]||"?").join("").replace(/\s+/g," ").trim()
}

function decodeBinary(bin){
  return bin.trim().split(/\s+/).map(b=>{
    try{
      return String.fromCharCode(parseInt(b,2))
    }catch(e){
      return "?"
    }
  }).join("")
}

function decodeBase64(b64){
  try{
    return atob(b64)
  }catch(e){
    return "Erro ao decodificar Base64"
  }
}

function caesarShift(str,shift){
  shift = ((shift%26)+26)%26
  return str.split("").map(ch=>{
    const code = ch.charCodeAt(0)
    if(code>=65 && code<=90) return String.fromCharCode(((code-65+shift)%26)+65)
    if(code>=97 && code<=122) return String.fromCharCode(((code-97+shift)%26)+97)
    return ch
  }).join("")
}

// render puzzles
const list = document.getElementById("puzzle-list")
const scoreSpan = document.getElementById("score")
let state = JSON.parse(localStorage.getItem("osint_state")||'{}')

function saveState(){ localStorage.setItem("osint_state", JSON.stringify(state)) }
function addPuzzleCard(p){
  const card = document.createElement("div")
  card.className = "puzzle"
  card.innerHTML = `
    <h3>${p.title}</h3>
    <div class="meta">Tipo: ${p.type.toUpperCase()}</div>
    <div class="prompt"><strong>Enigma:</strong><div class="small">${p.prompt}</div></div>
    <div class="hint"><strong>Dica:</strong> ${p.hint}</div>
    <div class="actions">
      <input placeholder="Resposta" id="input-${p.id}" />
      <button id="btn-${p.id}">Enviar</button>
      <button id="hint-${p.id}">Mostrar dica extra</button>
      <div id="res-${p.id}" class="output"></div>
    </div>
  `
  list.appendChild(card)

  document.getElementById(`btn-${p.id}`).addEventListener("click",()=>{
    const val = document.getElementById(`input-${p.id}`).value.trim()
    const res = document.getElementById(`res-${p.id}`)
    // validation by type
    if(p.type==="morse"){
      const decoded = decodeMorse(p.prompt)
      if(val.toUpperCase()===decoded.replace(/\s+/g," ").trim().toUpperCase()){
        res.textContent = "✓ Correto!"
        awardPoint(p.id)
      }else{
        res.textContent = "✗ Errado. Tente de novo."
      }
    }else if(p.type==="binary"){
      const decoded = decodeBinary(p.prompt)
      if(val.toUpperCase()===decoded.toUpperCase()){
        res.textContent = "✓ Correto!"
        awardPoint(p.id)
      }else res.textContent = "✗ Errado. Verifique ASCII/8-bit."
    }else if(p.type==="base64"){
      const decoded = decodeBase64(p.prompt)
      if(val.toUpperCase()===decoded.toUpperCase()){
        res.textContent = "✓ Correto!"
        awardPoint(p.id)
      }else res.textContent = "✗ Errado."
    }else if(p.type==="caesar"){
      const decoded = caesarShift(p.prompt, -5)
      if(val.toUpperCase()===decoded.toUpperCase()){
        res.textContent = "✓ Correto!"
        awardPoint(p.id)
      }else res.textContent = "✗ Errado. Experimente deslocar letras."
    }else if(p.type==="osint"){
      if(val.length>0){
        res.textContent = "Resposta recebida. (Este enigma exige pesquisa externa.)"
        awardPoint(p.id)
      }else res.textContent = "✗ Forneça uma resposta (formato YYYY-MM-DD neste caso)."
    }else{
      res.textContent = "Tipo de enigma desconhecido."
    }
  })

  document.getElementById(`hint-${p.id}`).addEventListener("click",()=>{
    const res = document.getElementById(`res-${p.id}`)
    res.textContent = "Dica extra: " + p.hint + " (Tente usar as ferramentas na página.)"
  })
}

function awardPoint(id){
  if(!state.awarded) state.awarded = {}
  if(state.awarded[id]) return
  state.awarded[id]=true
  state.score = (state.score||0)+10
  scoreSpan.textContent = state.score
  saveState()
}

// init
puzzles.forEach(addPuzzleCard)
document.getElementById("score").textContent = state.score||0

// tools behavior
document.getElementById("morse-decode").addEventListener("click", ()=>{
  const inpt = document.getElementById("morse-input").value
  document.getElementById("morse-output").textContent = inpt ? decodeMorse(inpt) : "Insira código Morse acima."
})

document.getElementById("binary-decode").addEventListener("click", ()=>{
  const inpt = document.getElementById("binary-input").value
  document.getElementById("binary-output").textContent = inpt ? decodeBinary(inpt) : "Insira binário (separe por espaços)."
})

document.getElementById("b64-decode").addEventListener("click", ()=>{
  const inpt = document.getElementById("b64-input").value
  document.getElementById("b64-output").textContent = inpt ? decodeBase64(inpt) : "Insira Base64."
})

document.getElementById("caesar-encode").addEventListener("click", ()=>{
  const shift = parseInt(document.getElementById("caesar-shift").value||0,10)
  const inpt = document.getElementById("caesar-input").value||""
  document.getElementById("caesar-output").textContent = caesarShift(inpt, shift)
})

document.getElementById("reset-progress").addEventListener("click", ()=>{
  if(confirm("Resetar progresso e pontuação?")){
    state = {}
    saveState()
    document.getElementById("score").textContent = "0"
    // reload to reset awarded marks
    location.reload()
  }
})