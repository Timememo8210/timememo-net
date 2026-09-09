// Self-hosted browser OCR; no image is sent to an external recognition service.
export function startOCR(file, onProgress = () => {}, timeoutMs = 45000) {
  let worker,
    stopped = false,
    rejectStop;
  const stopPromise = new Promise((_, reject) => {
    rejectStop = reject;
  });
  const cancel = (code = "canceled") => {
    stopped = true;
    worker?.terminate();
    rejectStop(Error(code));
  };
  const timer = setTimeout(() => cancel("timeout"), timeoutMs);
  const task = (async () => {
    const bitmap = await createImageBitmap(file);
    const width = bitmap.width,
      height = bitmap.height;
    bitmap.close();
    if (width * height > 25000000) throw Error("too_many_pixels");
    if (stopped) throw Error("canceled");
    const { default: Tesseract } = await import(
      "./vendor/ocr/tesseract.esm.min.js"
    );
    worker = await Tesseract.createWorker("eng", 1, {
      workerPath: new URL("./vendor/ocr/worker.min.js", import.meta.url).href,
      corePath: new URL("./vendor/ocr/core/", import.meta.url).href,
      langPath: new URL("./vendor/ocr/lang/", import.meta.url).href,
      logger: (event) => {
        if (!stopped) onProgress(event);
      },
      errorHandler: () => {
        if (!stopped) cancel("engine_failed");
      },
    });
    if (stopped) {
      await worker.terminate();
      throw Error("canceled");
    }
    const { data } = await worker.recognize(file);
    return { text: data.text, confidence: data.confidence };
  })();
  const promise = Promise.race([task, stopPromise]).finally(() => {
    clearTimeout(timer);
    stopped = true;
    worker?.terminate();
  });
  return { promise, cancel };
}
