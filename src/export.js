export function exportJPEG(deck, filename = 'estabelecimentos-br.jpg') {
  deck.redraw(true);
  const canvas = deck.getCanvas();
  canvas.toBlob(
    blob => {
      if (!blob) {
        alert('Erro ao gerar imagem. Verifique se preserveDrawingBuffer está ativado.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    'image/jpeg',
    0.92,
  );
}
