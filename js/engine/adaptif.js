/* Tingkat adaptif (CLAUDE.md bagian 5, GDD bagian 9): 3 benar beruntun naik satu tingkat, 2 salah beruntun turun satu tingkat.
   "Benar" berarti pelanggan dilayani tepat pada coba pertama. Pola dari soal.js Pabrik Ajaib, diringkas. */
(function (root) {
  function Adaptif(min, maks, awal) {
    this.min = min; this.maks = maks; this.t = awal || min; this.benar = 0; this.salah = 0;
  }
  Adaptif.prototype.catat = function (tepat) {
    if (tepat) {
      this.benar++; this.salah = 0;
      if (this.benar >= 3 && this.t < this.maks) { this.t++; this.benar = 0; }
    } else {
      this.salah++; this.benar = 0;
      if (this.salah >= 2 && this.t > this.min) { this.t--; this.salah = 0; }
    }
    return this.t;
  };
  root.Adaptif = Adaptif;
  if (typeof module !== 'undefined') module.exports = Adaptif;
})(typeof window !== 'undefined' ? window : globalThis);
