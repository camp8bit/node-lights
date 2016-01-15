function Panel (pixelData, start, stop) {
  if (stop < start) {
    throw new Error('Stop before start');
  }

  this.start = start;
  this.stop = stop;
}

module.exports = Panel;