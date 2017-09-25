import array from '../util/array'

const SAMPLE_RATE = 44100
const FFT_SIZE = 256 // ??
const MIN_VOLUME = 5

const detectVolume = data => {
  let volume = 0
  data.forEach(i => {
    volume += i
  })
  return volume / data.length > MIN_VOLUME
}

const recordPitch = data => {
  if (!detectVolume(data)) return
  let pitchArray = []
  let lastPosition = 0
  let lastItem
  data.forEach((item, i) => {
    if (item > 128 && lastItem <= 128) {
      const elapsedSteps = i - lastPosition
      lastPosition = i
      const hertz = 1 / (elapsedSteps / SAMPLE_RATE)
      pitchArray.push(hertz)
    }
    lastItem = item
  })
  return array.mode(pitchArray)
}

export default (stream, callback) => {
  const context = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = context.createAnalyser()
  analyser.minDecibels = -90
  analyser.maxDecibels = -10
  analyser.fftSize = FFT_SIZE
  context.createMediaStreamSource(stream).connect(analyser)
  const data = new Uint8Array(analyser.frequencyBinCount)

  setInterval(() => {
    console.log(analyser)
    analyser.getByteTimeDomainData(data)
    console.log('Data recording', data)
    analyser.getByteFrequencyData(data)
    console.log('Data recording', data)
    callback(recordPitch(data))
  }, 250)
}